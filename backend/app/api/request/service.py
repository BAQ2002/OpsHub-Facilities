import base64
import json
from datetime import date
from ...database import DatabaseConnection, settings, sql
from .schemas import CreateRequest
from ..entities import BoardEntities, BoardRequestEntities, RequestContext, RequestStatusEntity

CLOSED = ("Concluída", "Concluida", "Cancelada")


# Full records remain distinct from page view models. Keep optional joins nullable.
REQUEST_SELECT = """SELECT to_jsonb(R) AS request,
    to_jsonb(RS) AS request_status, to_jsonb(RT) AS request_type,
    to_jsonb(ST) AS service_type, to_jsonb(SC) AS category,
    CASE WHEN L.ID IS NULL THEN NULL ELSE to_jsonb(L) ||
        jsonb_build_object('location_x', L.LOCATION_X::text, 'location_y', L.LOCATION_Y::text)
    END AS location,
    to_jsonb(RG) AS region, to_jsonb(B) AS business,
    CASE WHEN M.ID IS NULL THEN NULL ELSE jsonb_build_object('id', M.ID, 'name', M.NAME) END AS requester
    FROM REQUEST R
    JOIN REQUEST_STATUS RS ON RS.ID=R.ID_REQUEST_STATUS
    LEFT JOIN REQUEST_TYPE RT ON RT.ID=R.ID_REQUEST_TYPE
    LEFT JOIN SERVICE_TYPE ST ON ST.ID=R.ID_SERVICE_TYPE
    LEFT JOIN SERVICE_CATEGORY SC ON SC.ID=ST.ID_SERVICE_CATEGORY
    LEFT JOIN LOCATION L ON L.ID=R.ID_LOCATION
    LEFT JOIN REGION RG ON RG.ID=L.ID_REGION
    LEFT JOIN BUSINESS B ON B.ID=RG.ID_BUSINESS
    LEFT JOIN MEMBERSHIP M ON M.ID=R.ID_MEMBER_REQUESTER
"""

STATUS_DATE = """CASE WHEN RS.DESCRIPTION='Programada' THEN R.AGREED_DATE
    WHEN RS.DESCRIPTION='Em andamento' THEN R.STARTED_DATE
    WHEN RS.DESCRIPTION IN ('Concluída','Concluida') THEN R.FINISHED_DATE
    WHEN RS.DESCRIPTION='Cancelada' THEN R.CANCELED_DATE END"""


def get_my_requests(connection: DatabaseConnection, member_id: int) -> list[RequestContext]:
    rows = connection.execute(
        sql(REQUEST_SELECT + """WHERE R.ID_MEMBER_REQUESTER=:member
        ORDER BY R.CREATED_DATE DESC NULLS LAST,R.ID DESC"""),
        {"member": member_id},
    ).mappings()
    return [RequestContext.model_validate(row) for row in rows]


def create_request(connection: DatabaseConnection, data: CreateRequest) -> int:
    location = connection.execute(
        sql("""SELECT RG.ID_BUSINESS
    FROM LOCATION L
        JOIN REGION RG
            ON RG.ID=L.ID_REGION
    WHERE L.ID=:location AND RG.ID=:region"""),
        {"location": data.locationId, "region": data.regionId},
    ).scalar_one_or_none()
    if location != data.businessId:
        raise ValueError("A localização não pertence à organização informada.")
    status_id = connection.execute(sql("""SELECT ID
    FROM REQUEST_STATUS
    WHERE DESCRIPTION IN ('Em aberto','Aberto')
    ORDER BY ID
    LIMIT 1""")).scalar_one_or_none() or 1
    requester = settings.current_member_id
    request_id = connection.execute(
        sql("""INSERT INTO REQUEST (
    ID_REQUEST_TYPE,
    ID_MEMBER_REQUESTER,
    ID_LOCATION,
    ID_SERVICE_TYPE,
    ID_REQUEST_STATUS,
    CREATED_DATE,
    DESCRIPTION
)
VALUES (
    1,
    :member,
    :location,
    :service,
    :status,
    CURRENT_TIMESTAMP,
    :description
)
RETURNING ID"""),
        {
            "member": requester,
            "location": data.locationId,
            "service": data.serviceTypeId,
            "status": status_id,
            "description": data.description,
        },
    ).scalar_one()
    for field in data.additionalFields:
        field_id = int(field.name.removeprefix("service_field_"))
        strings = []
        for value in field.values:
            if isinstance(value, str):
                strings.append(value)
            else:
                content = base64.b64decode(value.contentBase64)
                connection.execute(
                    sql("""INSERT INTO SERVICE_FIELD_MEDIA (
    ID_SERVICE_FIELD_TYPE,
    ID_REQUEST,
    CONTENT,
    FILE_NAME,
    MIME_TYPE,
    FILE_SIZE
)
VALUES (
    :field,
    :request,
    :content,
    :name,
    :mime,
    :size
)"""),
                    {
                        "field": field_id,
                        "request": request_id,
                        "content": content,
                        "name": value.fileName,
                        "mime": value.mimeType,
                        "size": len(content),
                    },
                )
        if strings:
            connection.execute(
                sql("""INSERT INTO SERVICE_FIELD_VALUE (
    ID_SERVICE_FIELD_TYPE,
    ID_REQUEST,
    VALUE
)
VALUES (
    :field,
    :request,
    CAST(:value AS JSONB)
)"""),
                {
                    "field": field_id,
                    "request": request_id,
                    "value": json.dumps(strings if len(strings) > 1 else strings[0]),
                },
            )
    connection.commit()
    return request_id


def get_activities(
    connection: DatabaseConnection,
    start: date,
    end: date,
    statuses: list[str],
    businesses: list[int],
) -> list[RequestContext]:
    query = sql(REQUEST_SELECT + f"""WHERE
        (:all_status OR RS.DESCRIPTION = ANY(CAST(:statuses AS TEXT[])))
        AND (:all_business OR B.ID = ANY(CAST(:businesses AS INTEGER[])))
        AND ({STATUS_DATE}) >= :start AND ({STATUS_DATE}) < (:end + INTERVAL '1 day')
        ORDER BY ({STATUS_DATE}),R.ID""")
    return [RequestContext.model_validate(row) for row in connection.execute(query, {
        "start": start, "end": end, "statuses": statuses, "all_status": not statuses,
        "businesses": businesses, "all_business": not businesses,
    }).mappings()]


def get_home_metrics(connection: DatabaseConnection, start: date, end: date):
    rows = connection.execute(
        sql("""SELECT SC.ID,
       SC.NAME,
       COUNT(R.ID) FILTER(WHERE R.ID_REQUEST_STATUS=2 AND R.AGREED_DATE>=:start AND R.AGREED_DATE<(:end+INTERVAL '1 day')) PLANNED,
       COUNT(R.ID) FILTER(WHERE R.ID_REQUEST_STATUS=3 AND R.STARTED_DATE>=:start AND R.STARTED_DATE<(:end+INTERVAL '1 day')) IN_PROGRESS,
       COUNT(R.ID) FILTER(WHERE R.ID_REQUEST_STATUS=4 AND R.FINISHED_DATE>=:start AND R.FINISHED_DATE<(:end+INTERVAL '1 day')) COMPLETED
    FROM SERVICE_CATEGORY SC
        JOIN SERVICE_TYPE ST
            ON ST.ID_SERVICE_CATEGORY=SC.ID
        LEFT JOIN REQUEST R
            ON R.ID_SERVICE_TYPE=ST.ID
    GROUP BY SC.ID,SC.NAME
    ORDER BY SC.NAME"""),
        {"start": start, "end": end},
    ).mappings()
    samples = connection.execute(
        sql(
            """SELECT EXTRACT(EPOCH FROM(FINISHED_DATE-STARTED_DATE))/60 MINUTES
    FROM REQUEST
    WHERE FINISHED_DATE>=:start AND FINISHED_DATE<(:end+INTERVAL '1 day') AND STARTED_DATE IS NOT NULL"""
        ),
        {"start": start, "end": end},
    ).scalars()
    return {
        "equipment": [
            {
                "categoryId": r["id"],
                "categoryName": r["name"] or "Não informado",
                "planned": r["planned"],
                "inProgress": r["in_progress"],
                "completed": r["completed"],
            }
            for r in rows
        ],
        "handlingMinutes": [float(v) for v in samples if v and v > 0] or [0],
    }


def get_tracking(
    connection: DatabaseConnection,
    start: date,
    end: date,
    business: int | None,
    category: int | None,
):
    p = {
        "start": start,
        "end": end,
        "business": business,
        "category": category,
        "closed": list(CLOSED),
    }
    joins = """    FROM REQUEST R
        JOIN REQUEST_STATUS RS
            ON RS.ID=R.ID_REQUEST_STATUS
        JOIN SERVICE_TYPE ST
            ON ST.ID=R.ID_SERVICE_TYPE
        JOIN SERVICE_CATEGORY SC
            ON SC.ID=ST.ID_SERVICE_CATEGORY
        LEFT JOIN LOCATION L
            ON L.ID=R.ID_LOCATION
        LEFT JOIN REGION RG
            ON RG.ID=L.ID_REGION"""
    where = """    WHERE R.CREATED_DATE>=:start AND R.CREATED_DATE<(:end+INTERVAL '1 day') AND (CAST(:business AS INTEGER) IS NULL OR RG.ID_BUSINESS=:business) AND (CAST(:category AS INTEGER) IS NULL OR SC.ID=:category)"""
    summary = (
        connection.execute(
            sql(
                """SELECT COUNT(*) TOTAL,
       COUNT(*) FILTER(WHERE RS.DESCRIPTION='Em andamento') IN_PROGRESS,
       ROUND(AVG(EXTRACT(EPOCH FROM(COALESCE(R.FINISHED_DATE,R.CANCELED_DATE,NOW())-R.CREATED_DATE))/60))::INTEGER AVERAGE_MINUTES,
       COUNT(*) FILTER(WHERE RS.DESCRIPTION <> ALL(CAST(:closed AS TEXT[])) AND R.AGREED_DATE IS NOT NULL AND R.AGREED_DATE<NOW()) CRITICAL"""
                + "\n"
                + joins
                + "\n"
                + where
            ),
            p,
        )
        .mappings()
        .one()
    )
    cats = connection.execute(
        sql(
            """SELECT SC.ID CATEGORY_ID, COALESCE(SC.NAME,'Não informado') LABEL,
       COUNT(*) VALUE"""
            + "\n"
            + joins
            + "\n"
            + where
            + "\n"
            + """    GROUP BY SC.ID,SC.NAME
    ORDER BY VALUE DESC"""
        ),
        p,
    ).mappings()
    statuses = connection.execute(
        sql(
            """SELECT COALESCE(RS.DESCRIPTION,'Não informado') LABEL,
       COUNT(*) VALUE"""
            + "\n"
            + joins
            + "\n"
            + where
            + "\n"
            + """    GROUP BY RS.ID,RS.DESCRIPTION
    ORDER BY RS.ID"""
        ),
        p,
    ).mappings()
    months = connection.execute(
        sql(
            """SELECT TO_CHAR(DATE_TRUNC('month',R.CREATED_DATE),'Mon') AS MONTH,
       COUNT(*) FILTER(WHERE RS.DESCRIPTION <> ALL(CAST(:closed AS TEXT[]))) AS OPEN,
       COUNT(*) FILTER(WHERE RS.DESCRIPTION = ANY(CAST(:closed AS TEXT[]))) AS CLOSED"""
            + "\n"
            + joins
            + "\n"
            + where
            + "\n"
            + """    GROUP BY DATE_TRUNC('month',R.CREATED_DATE)
    ORDER BY DATE_TRUNC('month',R.CREATED_DATE)"""
        ),
        p,
    ).mappings()
    businesses = connection.execute(sql("""SELECT ID,
       NAME
    FROM BUSINESS
    ORDER BY NAME""")).mappings()
    categories = connection.execute(sql("""SELECT ID,
       NAME
    FROM SERVICE_CATEGORY
    ORDER BY NAME""")).mappings()
    scolors = ["#f97316", "#0ea5e9", "#84cc16", "#8b5cf6", "#64748b"]

    def chart(rows, palette):
        return [
            {
                "label": row["label"],
                "value": row["value"],
                "color": palette[index % len(palette)],
            }
            for index, row in enumerate(rows)
        ]

    avg = max(0, int(summary["average_minutes"] or 0))
    return {
        "categoryData": [
            {"categoryId": row["category_id"], "label": row["label"], "value": row["value"]}
            for row in cats
        ],
        "statusData": chart(statuses, scolors),
        "monthlyData": [
            {"month": r["month"].capitalize(), "open": r["open"], "closed": r["closed"]}
            for r in months
        ],
        "summaryCards": [
            {
                "label": "Chamados no período",
                "value": str(summary["total"]),
                "detail": "Criados no intervalo selecionado",
                "color": "text-teal-600",
                "bg": "bg-teal-50",
            },
            {
                "label": "Em atendimento",
                "value": str(summary["in_progress"]),
                "detail": "Equipes acionadas",
                "color": "text-sky-600",
                "bg": "bg-sky-50",
            },
            {
                "label": "Tempo médio",
                "value": f"{avg//60}h {avg%60:02d}min",
                "detail": "Da abertura à finalização ou agora",
                "color": "text-violet-600",
                "bg": "bg-violet-50",
            },
            {
                "label": "Pendentes críticos",
                "value": str(summary["critical"]),
                "detail": "Prazo acordado vencido",
                "color": "text-orange-600",
                "bg": "bg-orange-50",
            },
        ],
        "filterOptions": {
            "businesses": [dict(r) for r in businesses],
            "serviceCategories": [dict(r) for r in categories],
        },
    }


def get_board(
    connection: DatabaseConnection, start: date, end: date, search: str | None = None,
) -> BoardEntities:
    statuses = [RequestStatusEntity.model_validate(row) for row in connection.execute(
        "SELECT ID, DESCRIPTION FROM REQUEST_STATUS ORDER BY ID"
    ).mappings()]
    rows = connection.execute(sql(REQUEST_SELECT + """WHERE
        R.CREATED_DATE>=:start AND R.CREATED_DATE<(:end+INTERVAL '1 day')
        AND (CAST(:search AS TEXT) IS NULL
            OR CAST(R.ID AS TEXT) ILIKE :search_pattern
            OR COALESCE(ST.NAME,'') ILIKE :search_pattern
            OR COALESCE(M.NAME,'') ILIKE :search_pattern
            OR COALESCE(L.NAME,'') ILIKE :search_pattern
            OR COALESCE(R.DESCRIPTION,'') ILIKE :search_pattern)
        ORDER BY R.CREATED_DATE,R.ID"""), {
        "start": start, "end": end,
        "search": search.strip() if search and search.strip() else None,
        "search_pattern": f"%{search.strip()}%" if search and search.strip() else None,
    }).mappings()
    requests = []
    for row in rows:
        request_id = row["request"]["id"]
        visits = []
        tasks = connection.execute(sql("""SELECT * FROM REQUEST_TASK
            WHERE ID_REQUEST=:id ORDER BY START_DATETIME,ID"""), {"id": request_id}).mappings()
        for task in tasks:
            task_params = {"id": task["id"]}
            executors = list(connection.execute(sql("""SELECT to_jsonb(O) AS occurrence,
                jsonb_build_object('id', M.ID, 'name', M.NAME) AS member
                FROM TASK_MEMBER_OCCURRENCE O JOIN MEMBERSHIP M ON M.ID=O.ID_MEMBERSHIP
                WHERE O.ID_TASK=:id ORDER BY M.NAME"""), task_params).mappings())
            photos = [dict(photo, url=f'/api/v1/request-tasks/media/{photo["id"]}')
                for photo in connection.execute(sql("""SELECT ID, FILE_NAME, MIME_TYPE
                    FROM REQUEST_TASK_MEDIA WHERE ID_REQUEST_TASK=:id"""), task_params).mappings()]
            checklists = []
            for checklist in connection.execute(sql("""SELECT to_jsonb(RTC) AS checklist,
                to_jsonb(CT) AS definition FROM REQUEST_TASK_CHECKLIST RTC
                JOIN CHECKLIST_TYPE CT ON CT.ID=RTC.ID_CHECKLIST_TYPE
                WHERE RTC.ID_REQUEST_TASK=:id ORDER BY RTC.ID"""), task_params).mappings():
                values = list(connection.execute(sql("""SELECT to_jsonb(CFV) AS value,
                    to_jsonb(CFT) AS field FROM CHECKLIST_FIELD_VALUE CFV
                    JOIN CHECKLIST_FIELD_TYPE CFT ON CFT.ID=CFV.ID_CHECKLIST_FIELD_TYPE
                    WHERE CFV.ID_REQUEST_TASK_CHECKLIST=:id ORDER BY CFT.DISPLAY_ORDER,CFT.ID"""),
                    {"id": checklist["checklist"]["id"]}).mappings())
                checklists.append(dict(checklist, values=values))
            visits.append({"task": task, "executors": executors, "photos": photos, "checklists": checklists})
        values = list(connection.execute(sql("""SELECT to_jsonb(SFV) AS value,
            to_jsonb(SFT) AS field FROM SERVICE_FIELD_VALUE SFV
            JOIN SERVICE_FIELD_TYPE SFT ON SFT.ID=SFV.ID_SERVICE_FIELD_TYPE
            WHERE SFV.ID_REQUEST=:id ORDER BY SFT.DISPLAY_ORDER NULLS LAST,SFV.ID"""),
            {"id": request_id}).mappings())
        media = [dict(item, url=f'/api/v1/service-catalog/media/{item["id"]}')
            for item in connection.execute(sql("""SELECT M.ID, SFT.NAME AS field_label,
                M.FILE_NAME, M.MIME_TYPE, M.FILE_SIZE FROM SERVICE_FIELD_MEDIA M
                JOIN SERVICE_FIELD_TYPE SFT ON SFT.ID=M.ID_SERVICE_FIELD_TYPE
                WHERE M.ID_REQUEST=:id"""), {"id": request_id}).mappings()]
        requests.append(BoardRequestEntities.model_validate(dict(row, values=values, media=media, visits=visits)))
    return BoardEntities(statuses=statuses, requests=requests)
