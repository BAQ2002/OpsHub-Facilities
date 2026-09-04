from ....database import DatabaseConnection, sql
from .schemas import ChecklistDefinition, ChecklistField, ChecklistSubmission


def get_active_definitions(connection: DatabaseConnection) -> list[ChecklistDefinition]:
    rows = connection.execute(sql("""SELECT CT.ID,
       CT.NAME,
       CT.DESCRIPTION,
       CT.VERSION,
       CF.ID FIELD_ID,
       CF.NAME FIELD_NAME,
       CF.TYPE,
       CF.OPTIONS,
       CF.REQUIRED
    FROM CHECKLIST_TYPE CT
        LEFT JOIN CHECKLIST_FIELD_TYPE CF
            ON CF.ID_CHECKLIST_TYPE=CT.ID AND CF.ACTIVE IS TRUE
    WHERE CT.ACTIVE IS TRUE
    ORDER BY CT.ID,CF.DISPLAY_ORDER NULLS LAST,CF.ID""")).mappings()
    result = {}
    for r in rows:
        item = result.setdefault(
            r["id"],
            ChecklistDefinition(
                id=r["id"],
                name=r["name"],
                description=r["description"] or "",
                version=r["version"] or "",
                fields=[],
            ),
        )
        if r["field_id"]:
            opts = r["options"] if isinstance(r["options"], list) else []
            item.fields.append(
                ChecklistField(
                    id=r["field_id"],
                    name=r["field_name"],
                    type=r["type"],
                    options=[{"label": str(v), "value": str(v)} for v in opts],
                    required=bool(r["required"]),
                )
            )
    return list(result.values())


def add_to_visit(
    connection: DatabaseConnection, visit_id: int, data: ChecklistSubmission
) -> None:
    row = connection.execute(
        sql("""INSERT INTO REQUEST_TASK_CHECKLIST (
    ID_REQUEST_TASK,
    ID_CHECKLIST_TYPE,
    CORPORATION,
    EQUIPMENT_TAG,
    EQUIPMENT_BRAND,
    EQUIPMENT_MODEL,
    RENTED_EQUIPMENT,
    SERIAL_NUMBER,
    PT_NUMBER
)
VALUES (
    :visit,
    :type,
    :corporation,
    :tag,
    :brand,
    :model,
    :rented,
    :serial,
    :pt
)
RETURNING ID"""),
        {
            "visit": visit_id,
            "type": data.checklistTypeId,
            "corporation": data.corporation,
            "tag": data.equipmentTag,
            "brand": data.equipmentBrand,
            "model": data.equipmentModel,
            "rented": data.rentedEquipment,
            "serial": data.serialNumber,
            "pt": data.ptNumber,
        },
    ).scalar_one()
    for value in data.values:
        connection.execute(
            sql("""INSERT INTO CHECKLIST_FIELD_VALUE (
    ID_REQUEST_TASK_CHECKLIST,
    ID_CHECKLIST_FIELD_TYPE,
    VALUE
)
VALUES (
    :checklist,
    :field,
    CAST(:value AS JSONB)
)"""),
            {
                "checklist": row,
                "field": value.fieldId,
                "value": __import__("json").dumps(value.value),
            },
        )
    connection.commit()


def delete_from_visit(connection: DatabaseConnection, checklist_id: int) -> None:
    connection.execute(
        sql("""DELETE
    FROM CHECKLIST_FIELD_VALUE
    WHERE ID_REQUEST_TASK_CHECKLIST=:id"""),
        {"id": checklist_id},
    )
    connection.execute(
        sql("""DELETE
    FROM REQUEST_TASK_CHECKLIST
    WHERE ID=:id"""),
        {"id": checklist_id},
    )
    connection.commit()
