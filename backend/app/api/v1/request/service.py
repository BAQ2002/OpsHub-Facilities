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
        sql(
            """SELECT r.id,COALESCE(st.name,'Solicitação') title,r.created_date,rs.description status FROM request r JOIN request_status rs ON rs.id=r.id_request_status LEFT JOIN service_type st ON st.id=r.id_service_type WHERE (:member IS NULL OR r.id_member_requester=:member) ORDER BY r.created_date DESC NULLS LAST,r.id DESC"""
        ),
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
        sql(
            "SELECT rg.id_business FROM location l JOIN region rg ON rg.id=l.id_region WHERE l.id=:location AND rg.id=:region"
        ),
        {"location": data.locationId, "region": data.regionId},
    ).scalar_one_or_none()
    if location != data.businessId:
        raise ValueError("A localização não pertence à organização informada.")
    status_id = (
        connection.execute(
            sql(
                "SELECT id FROM request_status WHERE description IN ('Em aberto','Aberto') ORDER BY id LIMIT 1"
            )
        ).scalar_one_or_none()
        or 1
    )
    requester = int(os.getenv("CURRENT_MEMBER_ID", "8"))
    request_id = connection.execute(
        sql(
            """INSERT INTO request(id_request_type,id_member_requester,id_location,id_service_type,id_request_status,created_date,description) VALUES (1,:member,:location,:service,:status,CURRENT_TIMESTAMP,:description) RETURNING id"""
        ),
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
                    sql(
                        "INSERT INTO service_field_media(id_service_field_type,id_request,content,file_name,mime_type,file_size) VALUES (:field,:request,:content,:name,:mime,:size)"
                    ),
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
                sql(
                    "INSERT INTO service_field_value(id_service_field_type,id_request,value) VALUES (:field,:request,CAST(:value AS jsonb))"
                ),
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
    query = sql(
        """SELECT r.id,rt.name request_type,b.name business_unit,sc.id category_id,sc.name category,st.name service,l.name location,rs.description status,CASE WHEN rs.description='Programada' THEN r.agreed_date WHEN rs.description='Em andamento' THEN r.started_date WHEN rs.description IN ('Concluída','Concluida') THEN r.finished_date WHEN rs.description='Cancelada' THEN r.canceled_date END status_date,r.agreed_date,l.location_x map_x,l.location_y map_y FROM request r JOIN request_status rs ON rs.id=r.id_request_status LEFT JOIN request_type rt ON rt.id=r.id_request_type LEFT JOIN service_type st ON st.id=r.id_service_type LEFT JOIN service_category sc ON sc.id=st.id_service_category LEFT JOIN location l ON l.id=r.id_location LEFT JOIN region rg ON rg.id=l.id_region LEFT JOIN business b ON b.id=rg.id_business WHERE (:all_status OR rs.description = ANY(:statuses)) AND (:all_business OR b.id = ANY(:businesses)) AND CASE WHEN rs.description='Programada' THEN r.agreed_date WHEN rs.description='Em andamento' THEN r.started_date WHEN rs.description IN ('Concluída','Concluida') THEN r.finished_date WHEN rs.description='Cancelada' THEN r.canceled_date END >= :start AND CASE WHEN rs.description='Programada' THEN r.agreed_date WHEN rs.description='Em andamento' THEN r.started_date WHEN rs.description IN ('Concluída','Concluida') THEN r.finished_date WHEN rs.description='Cancelada' THEN r.canceled_date END < (:end + INTERVAL '1 day') ORDER BY status_date,r.id"""
    )
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
        sql(
            """SELECT sc.id,sc.name,COUNT(r.id) FILTER(WHERE r.id_request_status=2 AND r.agreed_date>=:start AND r.agreed_date<(:end+INTERVAL '1 day')) planned,COUNT(r.id) FILTER(WHERE r.id_request_status=3 AND r.started_date>=:start AND r.started_date<(:end+INTERVAL '1 day')) in_progress,COUNT(r.id) FILTER(WHERE r.id_request_status=4 AND r.finished_date>=:start AND r.finished_date<(:end+INTERVAL '1 day')) completed FROM service_category sc JOIN service_type st ON st.id_service_category=sc.id LEFT JOIN request r ON r.id_service_type=st.id GROUP BY sc.id,sc.name ORDER BY sc.name"""
        ),
        {"start": start, "end": end},
    ).mappings()
    samples = connection.execute(
        sql(
            "SELECT EXTRACT(EPOCH FROM(finished_date-started_date))/60 minutes FROM request WHERE finished_date>=:start AND finished_date<(:end+INTERVAL '1 day') AND started_date IS NOT NULL"
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
    joins = "FROM request r JOIN request_status rs ON rs.id=r.id_request_status JOIN service_type st ON st.id=r.id_service_type JOIN service_category sc ON sc.id=st.id_service_category LEFT JOIN location l ON l.id=r.id_location LEFT JOIN region rg ON rg.id=l.id_region"
    where = "WHERE r.created_date>=:start AND r.created_date<(:end+INTERVAL '1 day') AND (CAST(:business AS integer) IS NULL OR rg.id_business=:business) AND (CAST(:category AS integer) IS NULL OR sc.id=:category)"
    summary = (
        connection.execute(
            sql(
                "SELECT COUNT(*) total,COUNT(*) FILTER(WHERE rs.description='Em andamento') in_progress,ROUND(AVG(EXTRACT(EPOCH FROM(COALESCE(r.finished_date,r.canceled_date,NOW())-r.created_date))/60))::integer average_minutes,COUNT(*) FILTER(WHERE rs.description <> ALL(CAST(:closed AS text[])) AND r.agreed_date IS NOT NULL AND r.agreed_date<NOW()) critical "
                + joins
                + " "
                + where
            ),
            p,
        )
        .mappings()
        .one()
    )
    cats = connection.execute(
        sql(
            "SELECT COALESCE(sc.name,'Não informado') label,COUNT(*) value "
            + joins
            + " "
            + where
            + " GROUP BY sc.id,sc.name ORDER BY value DESC"
        ),
        p,
    ).mappings()
    statuses = connection.execute(
        sql(
            "SELECT COALESCE(rs.description,'Não informado') label,COUNT(*) value "
            + joins
            + " "
            + where
            + " GROUP BY rs.id,rs.description ORDER BY rs.id"
        ),
        p,
    ).mappings()
    months = connection.execute(
        sql(
            "SELECT TO_CHAR(date_trunc('month',r.created_date),'Mon') month,COUNT(*) FILTER(WHERE rs.description <> ALL(CAST(:closed AS text[]))) open,COUNT(*) FILTER(WHERE rs.description = ANY(CAST(:closed AS text[]))) closed "
            + joins
            + " "
            + where
            + " GROUP BY date_trunc('month',r.created_date) ORDER BY date_trunc('month',r.created_date)"
        ),
        p,
    ).mappings()
    businesses = connection.execute(
        sql("SELECT id,name FROM business ORDER BY name")
    ).mappings()
    categories = connection.execute(
        sql("SELECT id,name FROM service_category ORDER BY name")
    ).mappings()
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
    statuses = [
        dict(r)
        for r in connection.execute(
            sql("SELECT id,description FROM request_status ORDER BY id")
        ).mappings()
    ]
    rows = connection.execute(
        sql(
            """SELECT r.id,r.id_request_status status_id,COALESCE(st.name,'Não informado') service_type_name,COALESCE(m.name,'Não informado') requester_name,COALESCE(l.name,'Não informado') location_name,r.description FROM request r LEFT JOIN service_type st ON st.id=r.id_service_type LEFT JOIN membership m ON m.id=r.id_member_requester LEFT JOIN location l ON l.id=r.id_location WHERE r.created_date>=:start AND r.created_date<(:end+INTERVAL '1 day') ORDER BY r.created_date,r.id"""
        ),
        {"start": start, "end": end},
    ).mappings()
    result = []
    for r in rows:
        visits = []
        tasks = connection.execute(
            sql(
                "SELECT id,start_datetime,stop_datetime,description FROM request_task WHERE id_request=:id ORDER BY start_datetime,id"
            ),
            {"id": r["id"]},
        ).mappings()
        for t in tasks:
            members = [
                dict(x)
                for x in connection.execute(
                    sql(
                        "SELECT m.id,m.name FROM task_member_occurrence o JOIN membership m ON m.id=o.id_membership WHERE o.id_task=:id ORDER BY m.name"
                    ),
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
                    sql(
                        "SELECT id,file_name,mime_type FROM request_task_media WHERE id_request_task=:id"
                    ),
                    {"id": t["id"]},
                ).mappings()
            ]
            checklists = []
            for checklist in connection.execute(
                sql("""SELECT rtc.id, ct.id checklist_type_id, ct.name, ct.description,
                              ct.version, rtc.corporation, rtc.equipment_tag,
                              rtc.equipment_brand, rtc.equipment_model,
                              rtc.rented_equipment, rtc.serial_number, rtc.pt_number
                         FROM request_task_checklist rtc
                         JOIN checklist_type ct ON ct.id=rtc.id_checklist_type
                        WHERE rtc.id_request_task=:id ORDER BY rtc.id"""),
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
                        sql(
                            """SELECT cfv.id, cft.id field_id, cft.name, cft.type, cfv.value
                                 FROM checklist_field_value cfv
                                 JOIN checklist_field_type cft ON cft.id=cfv.id_checklist_field_type
                                WHERE cfv.id_request_task_checklist=:id
                                ORDER BY cft.display_order,cft.id"""
                        ),
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
            sql(
                "SELECT sfv.id,sft.name,sfv.value FROM service_field_value sfv JOIN service_field_type sft ON sft.id=sfv.id_service_field_type WHERE sfv.id_request=:id ORDER BY sft.display_order NULLS LAST,sfv.id"
            ),
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
                sql(
                    "SELECT m.id,sft.name field_label,m.file_name,m.mime_type,m.file_size FROM service_field_media m JOIN service_field_type sft ON sft.id=m.id_service_field_type WHERE m.id_request=:id"
                ),
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
