from ...database import DatabaseConnection, sql
from .schemas import ChecklistSubmission
from ..entities import ChecklistEntities


def get_active_definitions(connection: DatabaseConnection) -> list[ChecklistEntities]:
    rows = connection.execute("""SELECT to_jsonb(CT) AS checklist, to_jsonb(CF) AS field
        FROM CHECKLIST_TYPE CT
        LEFT JOIN CHECKLIST_FIELD_TYPE CF ON CF.ID_CHECKLIST_TYPE=CT.ID AND CF.ACTIVE IS TRUE
        WHERE CT.ACTIVE IS TRUE ORDER BY CT.ID,CF.DISPLAY_ORDER NULLS LAST,CF.ID""").mappings()
    result = {}
    for row in rows:
        item = result.setdefault(row["checklist"]["id"], {"checklist": row["checklist"], "fields": []})
        if row["field"] is not None:
            item["fields"].append(row["field"])
    return [ChecklistEntities.model_validate(item) for item in result.values()]


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
