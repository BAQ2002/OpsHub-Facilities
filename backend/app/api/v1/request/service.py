import base64
import json
import os
from datetime import date
from ....database import DatabaseConnection, sql
from .schemas import Activity, CreateRequest, RequestItem

CLOSED = ("Concluída", "Concluida", "Cancelada")


def get_my_requests(
    connection: DatabaseConnection, member_id: int | None
) -> list[RequestItem]:
    rows = connection.execute(
        sql("""SELECT R.ID,
       COALESCE(ST.NAME,'Solicitação') TITLE,
       R.CREATED_DATE,
       RS.DESCRIPTION STATUS
    FROM REQUEST R
        JOIN REQUEST_STATUS RS
            ON RS.ID=R.ID_REQUEST_STATUS
        LEFT JOIN SERVICE_TYPE ST
            ON ST.ID=R.ID_SERVICE_TYPE
    WHERE (:member IS NULL OR R.ID_MEMBER_REQUESTER=:member)
    ORDER BY R.CREATED_DATE DESC NULLS LAST,R.ID DESC"""),
        {"member": member_id},
    ).mappings()
    return [
        RequestItem(
            id=r["id"],
            title=r["title"],
            createdAt=(
                r["created_date"].strftime("%d/%m/%Y") if r["created_date"] else ""
            ),
            status="Fechado" if r["status"] in CLOSED else "Aberto",
        )
        for r in rows
    ]


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
    requester = int(os.getenv("CURRENT_MEMBER_ID", "8"))
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
) -> list[Activity]:
    query = sql("""SELECT R.ID,
       RT.NAME REQUEST_TYPE,
       B.NAME BUSINESS_UNIT,
       SC.ID CATEGORY_ID,
       SC.NAME CATEGORY,
       ST.NAME SERVICE,
       L.NAME LOCATION,
       RS.DESCRIPTION STATUS,
       CASE WHEN RS.DESCRIPTION='Programada' THEN R.AGREED_DATE WHEN RS.DESCRIPTION='Em andamento' THEN R.STARTED_DATE WHEN RS.DESCRIPTION IN ('Concluída','Concluida') THEN R.FINISHED_DATE WHEN RS.DESCRIPTION='Cancelada' THEN R.CANCELED_DATE END STATUS_DATE,
       R.AGREED_DATE,
       L.LOCATION_X MAP_X,
       L.LOCATION_Y MAP_Y
    FROM REQUEST R
        JOIN REQUEST_STATUS RS
            ON RS.ID=R.ID_REQUEST_STATUS
        LEFT JOIN REQUEST_TYPE RT
            ON RT.ID=R.ID_REQUEST_TYPE
        LEFT JOIN SERVICE_TYPE ST
            ON ST.ID=R.ID_SERVICE_TYPE
        LEFT JOIN SERVICE_CATEGORY SC
            ON SC.ID=ST.ID_SERVICE_CATEGORY
        LEFT JOIN LOCATION L
            ON L.ID=R.ID_LOCATION
        LEFT JOIN REGION RG
            ON RG.ID=L.ID_REGION
        LEFT JOIN BUSINESS B
            ON B.ID=RG.ID_BUSINESS
    WHERE (:all_status OR RS.DESCRIPTION = ANY(:statuses)) AND (:all_business OR B.ID = ANY(:businesses)) AND CASE WHEN RS.DESCRIPTION='Programada' THEN R.AGREED_DATE WHEN RS.DESCRIPTION='Em andamento' THEN R.STARTED_DATE WHEN RS.DESCRIPTION IN ('Concluída','Concluida') THEN R.FINISHED_DATE WHEN RS.DESCRIPTION='Cancelada' THEN R.CANCELED_DATE END >= :start AND CASE WHEN RS.DESCRIPTION='Programada' THEN R.AGREED_DATE WHEN RS.DESCRIPTION='Em andamento' THEN R.STARTED_DATE WHEN RS.DESCRIPTION IN ('Concluída','Concluida') THEN R.FINISHED_DATE WHEN RS.DESCRIPTION='Cancelada' THEN R.CANCELED_DATE END < (:end + INTERVAL '1 day')
    ORDER BY STATUS_DATE,R.ID""")
    return [
        Activity(**r)
        for r in connection.execute(
            query,
            {
                "start": start,
                "end": end,
                "statuses": statuses,
                "all_status": not statuses,
                "businesses": businesses,
                "all_business": not businesses,
            },
        ).mappings()
    ]


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
            """SELECT COALESCE(SC.NAME,'Não informado') LABEL,
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
    colors = ["#14b8a6", "#38bdf8", "#f59e0b", "#8b5cf6", "#ec4899", "#64748b"]
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
        "categoryData": chart(cats, colors),
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


def get_board(connection: DatabaseConnection, start: date, end: date):
    statuses = [dict(r) for r in connection.execute(sql("""SELECT ID,
       DESCRIPTION
    FROM REQUEST_STATUS
    ORDER BY ID""")).mappings()]
    rows = connection.execute(
        sql("""SELECT R.ID,
       R.ID_REQUEST_STATUS STATUS_ID,
       COALESCE(ST.NAME,'Não informado') SERVICE_TYPE_NAME,
       COALESCE(M.NAME,'Não informado') REQUESTER_NAME,
       COALESCE(L.NAME,'Não informado') LOCATION_NAME,
       R.DESCRIPTION
    FROM REQUEST R
        LEFT JOIN SERVICE_TYPE ST
            ON ST.ID=R.ID_SERVICE_TYPE
        LEFT JOIN MEMBERSHIP M
            ON M.ID=R.ID_MEMBER_REQUESTER
        LEFT JOIN LOCATION L
            ON L.ID=R.ID_LOCATION
    WHERE R.CREATED_DATE>=:start AND R.CREATED_DATE<(:end+INTERVAL '1 day')
    ORDER BY R.CREATED_DATE,R.ID"""),
        {"start": start, "end": end},
    ).mappings()
    result = []
    for r in rows:
        visits = []
        tasks = connection.execute(
            sql("""SELECT ID,
       START_DATETIME,
       STOP_DATETIME,
       DESCRIPTION
    FROM REQUEST_TASK
    WHERE ID_REQUEST=:id
    ORDER BY START_DATETIME,ID"""),
            {"id": r["id"]},
        ).mappings()
        for t in tasks:
            members = [
                dict(x)
                for x in connection.execute(
                    sql("""SELECT M.ID,
       M.NAME
    FROM TASK_MEMBER_OCCURRENCE O
        JOIN MEMBERSHIP M
            ON M.ID=O.ID_MEMBERSHIP
    WHERE O.ID_TASK=:id
    ORDER BY M.NAME"""),
                    {"id": t["id"]},
                ).mappings()
            ]
            photos = [
                {
                    "id": x["id"],
                    "fileName": x["file_name"] or "media",
                    "mimeType": x["mime_type"],
                    "url": f'/api/request-task-media/{x["id"]}',
                }
                for x in connection.execute(
                    sql("""SELECT ID,
       FILE_NAME,
       MIME_TYPE
    FROM REQUEST_TASK_MEDIA
    WHERE ID_REQUEST_TASK=:id"""),
                    {"id": t["id"]},
                ).mappings()
            ]
            checklists = []
            for checklist in connection.execute(
                sql("""SELECT RTC.ID,
       CT.ID CHECKLIST_TYPE_ID,
       CT.NAME,
       CT.DESCRIPTION,
       CT.VERSION,
       RTC.CORPORATION,
       RTC.EQUIPMENT_TAG,
       RTC.EQUIPMENT_BRAND,
       RTC.EQUIPMENT_MODEL,
       RTC.RENTED_EQUIPMENT,
       RTC.SERIAL_NUMBER,
       RTC.PT_NUMBER
    FROM REQUEST_TASK_CHECKLIST RTC
        JOIN CHECKLIST_TYPE CT
            ON CT.ID=RTC.ID_CHECKLIST_TYPE
    WHERE RTC.ID_REQUEST_TASK=:id
    ORDER BY RTC.ID"""),
                {"id": t["id"]},
            ).mappings():
                values = [
                    {
                        "id": value["id"],
                        "fieldId": value["field_id"],
                        "name": value["name"],
                        "type": value["type"],
                        "value": value["value"],
                    }
                    for value in connection.execute(
                        sql("""SELECT CFV.ID,
       CFT.ID FIELD_ID,
       CFT.NAME,
       CFT.TYPE,
       CFV.VALUE
    FROM CHECKLIST_FIELD_VALUE CFV
        JOIN CHECKLIST_FIELD_TYPE CFT
            ON CFT.ID=CFV.ID_CHECKLIST_FIELD_TYPE
    WHERE CFV.ID_REQUEST_TASK_CHECKLIST=:id
    ORDER BY CFT.DISPLAY_ORDER,CFT.ID"""),
                        {"id": checklist["id"]},
                    ).mappings()
                ]
                checklists.append(
                    {
                        "id": checklist["id"],
                        "checklistTypeId": checklist["checklist_type_id"],
                        "name": checklist["name"],
                        "description": checklist["description"] or "",
                        "version": checklist["version"],
                        "corporation": checklist["corporation"],
                        "equipmentTag": checklist["equipment_tag"],
                        "equipmentBrand": checklist["equipment_brand"],
                        "equipmentModel": checklist["equipment_model"],
                        "rentedEquipment": checklist["rented_equipment"],
                        "serialNumber": checklist["serial_number"],
                        "ptNumber": checklist["pt_number"],
                        "values": values,
                    }
                )
            start_dt = t["start_datetime"]
            stop_dt = t["stop_datetime"]
            visits.append(
                {
                    "id": t["id"],
                    "startDate": start_dt.strftime("%d/%m/%Y") if start_dt else "",
                    "endDate": stop_dt.strftime("%d/%m/%Y") if stop_dt else "",
                    "startDatetime": (
                        start_dt.isoformat(timespec="minutes") if start_dt else ""
                    ),
                    "endDatetime": (
                        stop_dt.isoformat(timespec="minutes") if stop_dt else ""
                    ),
                    "description": t["description"] or "",
                    "executors": members,
                    "photos": photos,
                    "checklists": checklists,
                }
            )
        values = connection.execute(
            sql("""SELECT SFV.ID,
       SFT.NAME,
       SFV.VALUE
    FROM SERVICE_FIELD_VALUE SFV
        JOIN SERVICE_FIELD_TYPE SFT
            ON SFT.ID=SFV.ID_SERVICE_FIELD_TYPE
    WHERE SFV.ID_REQUEST=:id
    ORDER BY SFT.DISPLAY_ORDER NULLS LAST,SFV.ID"""),
            {"id": r["id"]},
        ).mappings()
        details = [
            {
                "id": str(v["id"]),
                "label": v["name"],
                "value": (
                    ", ".join(map(str, v["value"]))
                    if isinstance(v["value"], list)
                    else str(v["value"] or "")
                ),
            }
            for v in values
        ]
        if r["description"]:
            details.insert(
                0,
                {"id": "description", "label": "Descrição", "value": r["description"]},
            )
        media = [
            {
                "id": x["id"],
                "fieldLabel": x["field_label"],
                "fileName": x["file_name"] or "media",
                "mimeType": x["mime_type"],
                "fileSize": x["file_size"],
                "url": f'/api/request-media/{x["id"]}',
            }
            for x in connection.execute(
                sql("""SELECT M.ID,
       SFT.NAME FIELD_LABEL,
       M.FILE_NAME,
       M.MIME_TYPE,
       M.FILE_SIZE
    FROM SERVICE_FIELD_MEDIA M
        JOIN SERVICE_FIELD_TYPE SFT
            ON SFT.ID=M.ID_SERVICE_FIELD_TYPE
    WHERE M.ID_REQUEST=:id"""),
                {"id": r["id"]},
            ).mappings()
        ]
        result.append(
            {
                "id": r["id"],
                "statusId": r["status_id"],
                "serviceTypeName": r["service_type_name"],
                "requesterName": r["requester_name"],
                "locationName": r["location_name"],
                "details": details,
                "media": media,
                "visits": visits,
            }
        )
    return {"statuses": statuses, "requests": result}
