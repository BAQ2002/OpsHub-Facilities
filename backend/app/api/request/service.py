import base64
from datetime import date, datetime, time, timedelta
from ...database import DatabaseConnection, settings, sql, encode_json
from .schemas import CreateRequest
from ..entities import BoardEntities, BoardRequestEntities, RequestContext, RequestStatusEntity

from ..projections import projection

CLOSED = ("Concluída", "Concluida", "Cancelada")


# Full records remain distinct from page view models. Keep optional joins nullable.
REQUEST_SELECT = "SELECT " + ", ".join([
    projection("OHFC_REQUEST", "R", "request"),
    projection("OHFC_REQUEST_STATUS", "RS", "request_status"),
    projection("OHFC_REQUEST_TYPE", "RT", "request_type"),
    projection("OHFC_SERVICE_TYPE", "ST", "service_type"),
    projection("OHFC_SERVICE_CATEGORY", "SC", "category"),
    projection("OHFC_LOCATION", "L", "location"),
    projection("OHFC_REGION", "RG", "region"),
    projection("OHFC_BUSINESS", "B", "business"),
    'M.ID AS "requester__id", M.NAME AS "requester__name"',
]) + """
    FROM OHFC_REQUEST R
    JOIN OHFC_REQUEST_STATUS RS ON RS.ID=R.ID_REQUEST_STATUS
    LEFT JOIN OHFC_REQUEST_TYPE RT ON RT.ID=R.ID_REQUEST_TYPE
    LEFT JOIN OHFC_SERVICE_TYPE ST ON ST.ID=R.ID_SERVICE_TYPE
    LEFT JOIN OHFC_SERVICE_CATEGORY SC ON SC.ID=ST.ID_SERVICE_CATEGORY
    LEFT JOIN OHFC_LOCATION L ON L.ID=R.ID_LOCATION
    LEFT JOIN OHFC_REGION RG ON RG.ID=L.ID_REGION
    LEFT JOIN OHFC_BUSINESS B ON B.ID=RG.ID_BUSINESS
    LEFT JOIN OHFC_MEMBERSHIP M ON M.ID=R.ID_MEMBERSHIP_REQUESTER
"""

STATUS_DATE = """CASE WHEN RS.DESCRIPTION='Programada' THEN R.AGREED_DATE
    WHEN RS.DESCRIPTION='Em andamento' THEN R.STARTED_DATE
    WHEN RS.DESCRIPTION IN ('Concluída','Concluida') THEN R.FINISHED_DATE
    WHEN RS.DESCRIPTION='Cancelada' THEN R.CANCELED_DATE END"""


def get_my_requests(connection: DatabaseConnection, member_id: int) -> list[RequestContext]:
    rows = connection.execute(
        sql(REQUEST_SELECT + """WHERE R.ID_MEMBERSHIP_REQUESTER=:member
        ORDER BY R.CREATED_DATE DESC NULLS LAST,R.ID DESC"""),
        {"member": member_id},
    ).mappings()
    return [RequestContext.model_validate(row) for row in rows]


def create_request(connection: DatabaseConnection, data: CreateRequest) -> int:
    location = connection.execute(
        sql("""SELECT RG.ID_BUSINESS
    FROM OHFC_LOCATION L
        JOIN OHFC_REGION RG
            ON RG.ID=L.ID_REGION
    WHERE L.ID=:location AND RG.ID=:region"""),
        {"location": data.locationId, "region": data.regionId},
    ).scalar_one_or_none()
    if location != data.businessId:
        raise ValueError("A localização não pertence à organização informada.")
    status_id = connection.execute(sql("""SELECT ID
    FROM OHFC_REQUEST_STATUS
    WHERE DESCRIPTION IN ('Em aberto','Aberto')
    ORDER BY ID
    FETCH FIRST 1 ROW ONLY""")).scalar_one_or_none() or 1
    requester = settings.current_member_id
    request_id = connection.insert_id(
        sql("""INSERT INTO OHFC_REQUEST (
    ID_REQUEST_TYPE,
    ID_MEMBERSHIP_REQUESTER,
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
RETURNING ID INTO :new_id"""),
        {
            "member": requester,
            "location": data.locationId,
            "service": data.serviceTypeId,
            "status": status_id,
            "description": data.description,
        },
    )
    for field in data.additionalFields:
        field_id = int(field.name.removeprefix("service_field_"))
        strings = []
        for value in field.values:
            if isinstance(value, str):
                strings.append(value)
            else:
                content = base64.b64decode(value.contentBase64)
                connection.execute(
                    sql("""INSERT INTO OHFC_SERVICE_FIELD_MEDIA (
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
    :file_size
)"""),
                    {
                        "field": field_id,
                        "request": request_id,
                        "content": content,
                        "name": value.fileName,
                        "mime": value.mimeType,
                        "file_size": len(content),
                    },
                )
        if strings:
            connection.execute(
                sql("""INSERT INTO OHFC_SERVICE_FIELD_VALUE (
    ID_SERVICE_FIELD_TYPE,
    ID_REQUEST,
    VALUE
)
VALUES (
    :field,
    :request,
    :value
)"""),
                {
                    "field": field_id,
                    "request": request_id,
                    "value": encode_json(strings if len(strings) > 1 else strings[0]),
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
    params = {"range_start": datetime.combine(start, time.min),
              "range_end": datetime.combine(end + timedelta(days=1), time.min)}
    filters = [f"({STATUS_DATE}) >= :range_start AND ({STATUS_DATE}) < :range_end"]
    for column, prefix, values in [("RS.DESCRIPTION", "status", statuses), ("B.ID", "business", businesses)]:
        if values:
            # Oracle 19c supports at most 1000 expressions per IN clause.
            groups = []
            for offset in range(0, len(values), 1000):
                keys = []
                for i, value in enumerate(values[offset:offset + 1000], offset):
                    key = f"{prefix}_{i}"
                    params[key] = value
                    keys.append(":" + key)
                groups.append(column + " IN (" + ",".join(keys) + ")")
            filters.append("(" + " OR ".join(groups) + ")")
    query = REQUEST_SELECT + "WHERE " + " AND ".join(filters) + f" ORDER BY ({STATUS_DATE}),R.ID"
    return [RequestContext.model_validate(row) for row in connection.execute(query, params).mappings()]



def get_home_metrics(connection: DatabaseConnection, start: date, end: date):
    rows = connection.execute(
        sql("""SELECT SC.ID,
       SC.NAME,
       COUNT(CASE WHEN R.ID_REQUEST_STATUS=2 AND R.AGREED_DATE>=:range_start AND R.AGREED_DATE<:range_end THEN R.ID END) PLANNED,
       COUNT(CASE WHEN R.ID_REQUEST_STATUS=3 AND R.STARTED_DATE>=:range_start AND R.STARTED_DATE<:range_end THEN R.ID END) IN_PROGRESS,
       COUNT(CASE WHEN R.ID_REQUEST_STATUS=4 AND R.FINISHED_DATE>=:range_start AND R.FINISHED_DATE<:range_end THEN R.ID END) COMPLETED
    FROM OHFC_SERVICE_CATEGORY SC
        JOIN OHFC_SERVICE_TYPE ST
            ON ST.ID_SERVICE_CATEGORY=SC.ID
        LEFT JOIN OHFC_REQUEST R
            ON R.ID_SERVICE_TYPE=ST.ID
    GROUP BY SC.ID,SC.NAME
    ORDER BY SC.NAME"""),
        {"range_start": datetime.combine(start, time.min), "range_end": datetime.combine(end + timedelta(days=1), time.min)},
    ).mappings()
    samples = connection.execute(
        sql(
            """SELECT (EXTRACT(DAY FROM (FINISHED_DATE-STARTED_DATE))*1440+EXTRACT(HOUR FROM (FINISHED_DATE-STARTED_DATE))*60+EXTRACT(MINUTE FROM (FINISHED_DATE-STARTED_DATE))+EXTRACT(SECOND FROM (FINISHED_DATE-STARTED_DATE))/60) MINUTES
    FROM OHFC_REQUEST
    WHERE FINISHED_DATE>=:range_start AND FINISHED_DATE<:range_end AND STARTED_DATE IS NOT NULL"""
        ),
        {"range_start": datetime.combine(start, time.min), "range_end": datetime.combine(end + timedelta(days=1), time.min)},
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
        "range_start": datetime.combine(start, time.min),
        "range_end": datetime.combine(end + timedelta(days=1), time.min),
        "business": business,
        "category": category,
        "closed_0": CLOSED[0], "closed_1": CLOSED[1], "closed_2": CLOSED[2],
    }
    joins = """    FROM OHFC_REQUEST R
        JOIN OHFC_REQUEST_STATUS RS
            ON RS.ID=R.ID_REQUEST_STATUS
        JOIN OHFC_SERVICE_TYPE ST
            ON ST.ID=R.ID_SERVICE_TYPE
        JOIN OHFC_SERVICE_CATEGORY SC
            ON SC.ID=ST.ID_SERVICE_CATEGORY
        LEFT JOIN OHFC_LOCATION L
            ON L.ID=R.ID_LOCATION
        LEFT JOIN OHFC_REGION RG
            ON RG.ID=L.ID_REGION"""
    where = """    WHERE R.CREATED_DATE>=:range_start AND R.CREATED_DATE<:range_end AND (CAST(:business AS INTEGER) IS NULL OR RG.ID_BUSINESS=:business) AND (CAST(:category AS INTEGER) IS NULL OR SC.ID=:category)"""
    summary = (
        connection.execute(
            sql(
                """SELECT COUNT(*) TOTAL,
       COUNT(CASE WHEN RS.DESCRIPTION='Em andamento' THEN 1 END) IN_PROGRESS,
       COUNT(CASE WHEN RS.DESCRIPTION IN ('Concluída','Concluida') THEN 1 END) COMPLETED,
       COUNT(CASE WHEN RS.DESCRIPTION='Em aberto' THEN 1 END) OPEN,
       COUNT(CASE WHEN RS.DESCRIPTION='Cancelada' THEN 1 END) CANCELED"""
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
            """SELECT TO_CHAR(TRUNC(R.CREATED_DATE,'MM'),'Mon','NLS_DATE_LANGUAGE=PORTUGUESE') AS MONTH,
       COUNT(CASE WHEN RS.DESCRIPTION NOT IN (:closed_0,:closed_1,:closed_2) THEN 1 END) AS OPEN,
       COUNT(CASE WHEN RS.DESCRIPTION IN (:closed_0,:closed_1,:closed_2) THEN 1 END) AS CLOSED"""
            + "\n"
            + joins
            + "\n"
            + where
            + "\n"
            + """    GROUP BY TRUNC(R.CREATED_DATE,'MM')
    ORDER BY TRUNC(R.CREATED_DATE,'MM')"""
        ),
        p,
    ).mappings()
    businesses = connection.execute(sql("""SELECT ID,
       NAME
    FROM OHFC_BUSINESS
    ORDER BY NAME""")).mappings()
    categories = connection.execute(sql("""SELECT ID,
       NAME
    FROM OHFC_SERVICE_CATEGORY
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

    # Each clock selects its own event date, independently of the creation-date cards.
    timing = connection.execute(sql("""SELECT
       COALESCE(ROUND(AVG(CASE WHEN R.FINISHED_DATE>=:range_start AND R.FINISHED_DATE<:range_end
           AND R.FINISHED_DATE>R.STARTED_DATE THEN (EXTRACT(DAY FROM (R.FINISHED_DATE-R.STARTED_DATE))*1440+EXTRACT(HOUR FROM (R.FINISHED_DATE-R.STARTED_DATE))*60+EXTRACT(MINUTE FROM (R.FINISHED_DATE-R.STARTED_DATE))+EXTRACT(SECOND FROM (R.FINISHED_DATE-R.STARTED_DATE))/60) END)),0) HANDLING_MINUTES,
       COALESCE(ROUND(AVG(CASE WHEN R.STARTED_DATE>=:range_start AND R.STARTED_DATE<:range_end
           AND R.STARTED_DATE>=R.CREATED_DATE THEN (EXTRACT(DAY FROM (R.STARTED_DATE-R.CREATED_DATE))*1440+EXTRACT(HOUR FROM (R.STARTED_DATE-R.CREATED_DATE))*60+EXTRACT(MINUTE FROM (R.STARTED_DATE-R.CREATED_DATE))+EXTRACT(SECOND FROM (R.STARTED_DATE-R.CREATED_DATE))/60) END)),0) START_MINUTES
    FROM OHFC_REQUEST R
        JOIN OHFC_SERVICE_TYPE ST ON ST.ID=R.ID_SERVICE_TYPE
        LEFT JOIN OHFC_LOCATION L ON L.ID=R.ID_LOCATION
        LEFT JOIN OHFC_REGION RG ON RG.ID=L.ID_REGION
    WHERE (CAST(:business AS INTEGER) IS NULL OR RG.ID_BUSINESS=:business)
        AND (CAST(:category AS INTEGER) IS NULL OR ST.ID_SERVICE_CATEGORY=:category)
        AND ((R.FINISHED_DATE>=:range_start AND R.FINISHED_DATE<:range_end)
            OR (R.STARTED_DATE>=:range_start AND R.STARTED_DATE<:range_end))"""), p).mappings().one()
    return {
        "averageHandlingMinutes": timing["handling_minutes"],
        "averageStartMinutes": timing["start_minutes"],
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
                "label": "Chamados criados (todos)",
                "value": str(summary["total"]),
                "detail": "Criados no intervalo selecionado",
                "color": "text-teal-600",
                "bg": "bg-teal-50",
            },
            {
                "label": "Chamados concluídos",
                "value": str(summary["completed"]),
                "detail": "Concluídos entre os criados no período",
                "color": "text-lime-600",
                "bg": "bg-lime-50",
            },
            {
                "label": "Chamados em aberto",
                "value": str(summary["open"]),
                "detail": "Aguardando início do atendimento",
                "color": "text-orange-600",
                "bg": "bg-orange-50",
            },
            {
                "label": "Chamados em atendimento",
                "value": str(summary["in_progress"]),
                "detail": "Equipes acionadas",
                "color": "text-sky-600",
                "bg": "bg-sky-50",
            },
            {
                "label": "Chamados cancelados",
                "value": str(summary["canceled"]),
                "detail": "Cancelados entre os criados no período",
                "color": "text-rose-600",
                "bg": "bg-rose-50",
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
        "SELECT ID, DESCRIPTION FROM OHFC_REQUEST_STATUS ORDER BY ID"
    ).mappings()]
    rows = connection.execute(sql(REQUEST_SELECT + """WHERE
        R.CREATED_DATE>=:range_start AND R.CREATED_DATE<:range_end
        AND (CAST(:search AS VARCHAR2(4000)) IS NULL
            OR TO_CHAR(R.ID) LIKE :search_pattern
            OR UPPER(ST.NAME) LIKE UPPER(:search_pattern)
            OR UPPER(M.NAME) LIKE UPPER(:search_pattern)
            OR UPPER(L.NAME) LIKE UPPER(:search_pattern)
            OR UPPER(R.DESCRIPTION) LIKE UPPER(:search_pattern))
        ORDER BY R.CREATED_DATE,R.ID"""), {
        "range_start": datetime.combine(start, time.min), "range_end": datetime.combine(end + timedelta(days=1), time.min),
        "search": search.strip() if search and search.strip() else None,
        "search_pattern": f"%{search.strip()}%" if search and search.strip() else None,
    }).mappings()
    requests = []
    for row in rows:
        request_id = row["request"]["id"]
        visits = []
        tasks = connection.execute(sql("""SELECT * FROM OHFC_REQUEST_TASK
            WHERE ID_REQUEST=:id ORDER BY STARTED_DATE,ID"""), {"id": request_id}).mappings()
        for task in tasks:
            task_params = {"id": task["id"]}
            executors = list(connection.execute(sql(f"""{"SELECT " + projection("OHFC_TASK_MEMBER_OCCURRENCE", "O", "occurrence") + ', M.ID AS "member__id", M.NAME AS "member__name"'}
                FROM OHFC_TASK_MEMBER_OCCURRENCE O JOIN OHFC_MEMBERSHIP M ON M.ID=O.ID_MEMBERSHIP
                WHERE O.ID_REQUEST_TASK=:id ORDER BY M.NAME"""), task_params).mappings())
            photos = [dict(photo, url=f'/api/v1/request-tasks/media/{photo["id"]}')
                for photo in connection.execute(sql("""SELECT ID, FILE_NAME, MIME_TYPE
                    FROM OHFC_REQUEST_TASK_MEDIA WHERE ID_REQUEST_TASK=:id"""), task_params).mappings()]
            checklists = []
            for checklist in connection.execute(sql(f"""{"SELECT " + projection("OHFC_REQUEST_TASK_CHECKLIST", "RTC", "checklist") + ", " + projection("OHFC_CHECKLIST_TYPE", "CT", "definition")} FROM OHFC_REQUEST_TASK_CHECKLIST RTC
                JOIN OHFC_CHECKLIST_TYPE CT ON CT.ID=RTC.ID_CHECKLIST_TYPE
                WHERE RTC.ID_REQUEST_TASK=:id ORDER BY RTC.ID"""), task_params).mappings():
                values = list(connection.execute(sql(f"""{"SELECT " + projection("OHFC_CHECKLIST_FIELD_VALUE", "CFV", "value") + ", " + projection("OHFC_CHECKLIST_FIELD_TYPE", "CFT", "field")} FROM OHFC_CHECKLIST_FIELD_VALUE CFV
                    JOIN OHFC_CHECKLIST_FIELD_TYPE CFT ON CFT.ID=CFV.ID_CHECKLIST_FIELD_TYPE
                    WHERE CFV.ID_REQUEST_TASK_CHECKLIST=:id ORDER BY CFT.DISPLAY_ORDER,CFT.ID"""),
                    {"id": checklist["checklist"]["id"]}).mappings())
                checklists.append(dict(checklist, values=values))
            visits.append({"task": task, "executors": executors, "photos": photos, "checklists": checklists})
        values = list(connection.execute(sql(f"""{"SELECT " + projection("OHFC_SERVICE_FIELD_VALUE", "SFV", "value") + ", " + projection("OHFC_SERVICE_FIELD_TYPE", "SFT", "field")} FROM OHFC_SERVICE_FIELD_VALUE SFV
            JOIN OHFC_SERVICE_FIELD_TYPE SFT ON SFT.ID=SFV.ID_SERVICE_FIELD_TYPE
            WHERE SFV.ID_REQUEST=:id ORDER BY SFT.DISPLAY_ORDER NULLS LAST,SFV.ID"""),
            {"id": request_id}).mappings())
        media = [dict(item, url=f'/api/v1/service-catalog/media/{item["id"]}')
            for item in connection.execute(sql("""SELECT M.ID, SFT.NAME AS field_label,
                M.FILE_NAME, M.MIME_TYPE, M.FILE_SIZE FROM OHFC_SERVICE_FIELD_MEDIA M
                JOIN OHFC_SERVICE_FIELD_TYPE SFT ON SFT.ID=M.ID_SERVICE_FIELD_TYPE
                WHERE M.ID_REQUEST=:id"""), {"id": request_id}).mappings()]
        requests.append(BoardRequestEntities.model_validate(dict(row, values=values, media=media, visits=visits)))
    return BoardEntities(statuses=statuses, requests=requests)
