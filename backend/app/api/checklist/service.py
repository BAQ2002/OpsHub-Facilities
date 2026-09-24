from ..projections import projection
from ...database import DatabaseConnection, sql, encode_json
from .schemas import ChecklistSubmission
from ..entities import ChecklistEntities


def get_active_definitions(connection: DatabaseConnection) -> list[ChecklistEntities]:
    rows = connection.execute(f"""SELECT {projection("OHFC_CHECKLIST_TYPE", "CT", "checklist")}, {projection("OHFC_CHECKLIST_FIELD_TYPE", "CF", "field")}
        FROM OHFC_CHECKLIST_TYPE CT
        LEFT JOIN OHFC_CHECKLIST_FIELD_TYPE CF ON CF.ID_CHECKLIST_TYPE=CT.ID AND CF.ACTIVE = 1
        WHERE CT.ACTIVE = 1 ORDER BY CT.ID,CF.DISPLAY_ORDER NULLS LAST,CF.ID""").mappings()
    result = {}
    for row in rows:
        item = result.setdefault(row["checklist"]["id"], {"checklist": row["checklist"], "fields": []})
        if row["field"] is not None:
            item["fields"].append(row["field"])
    return [ChecklistEntities.model_validate(item) for item in result.values()]


def add_to_visit(
    connection: DatabaseConnection, visit_id: int, data: ChecklistSubmission
) -> None:
    row = connection.insert_id(
        sql("""INSERT INTO OHFC_REQUEST_TASK_CHECKLIST (
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
RETURNING ID INTO :new_id"""),
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
    )
    for value in data.values:
        connection.execute(
            sql("""INSERT INTO OHFC_CHECKLIST_FIELD_VALUE (
    ID_REQUEST_TASK_CHECKLIST,
    ID_CHECKLIST_FIELD_TYPE,
    VALUE
)
VALUES (
    :checklist,
    :field,
    :value
)"""),
            {
                "checklist": row,
                "field": value.fieldId,
                "value": encode_json(value.value),
            },
        )


def delete_from_visit(connection: DatabaseConnection, checklist_id: int) -> None:
    connection.execute(
        sql("""DELETE
    FROM OHFC_CHECKLIST_FIELD_VALUE
    WHERE ID_REQUEST_TASK_CHECKLIST=:id"""),
        {"id": checklist_id},
    )
    connection.execute(
        sql("""DELETE
    FROM OHFC_REQUEST_TASK_CHECKLIST
    WHERE ID=:id"""),
        {"id": checklist_id},
    )
    connection.commit()
