from ....database import DatabaseConnection, sql
from .schemas import ChecklistDefinition, ChecklistField, ChecklistSubmission


def get_active_definitions(connection: DatabaseConnection) -> list[ChecklistDefinition]:
    rows = connection.execute(
        sql(
            """SELECT ct.id,ct.name,ct.description,ct.version,cf.id field_id,cf.name field_name,cf.type,cf.options,cf.required FROM checklist_type ct LEFT JOIN checklist_field_type cf ON cf.id_checklist_type=ct.id AND cf.active IS TRUE WHERE ct.active IS TRUE ORDER BY ct.id,cf.display_order NULLS LAST,cf.id"""
        )
    ).mappings()
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
        sql(
            """INSERT INTO request_task_checklist(id_request_task,id_checklist_type,corporation,equipment_tag,equipment_brand,equipment_model,rented_equipment,serial_number,pt_number) VALUES (:visit,:type,:corporation,:tag,:brand,:model,:rented,:serial,:pt) RETURNING id"""
        ),
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
            sql(
                "INSERT INTO checklist_field_value(id_request_task_checklist,id_checklist_field_type,value) VALUES (:checklist,:field,CAST(:value AS jsonb))"
            ),
            {
                "checklist": row,
                "field": value.fieldId,
                "value": __import__("json").dumps(value.value),
            },
        )
    connection.commit()


def delete_from_visit(connection: DatabaseConnection, checklist_id: int) -> None:
    connection.execute(
        sql("DELETE FROM checklist_field_value WHERE id_request_task_checklist=:id"),
        {"id": checklist_id},
    )
    connection.execute(
        sql("DELETE FROM request_task_checklist WHERE id=:id"), {"id": checklist_id}
    )
    connection.commit()
