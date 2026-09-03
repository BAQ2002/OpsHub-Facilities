from ....database import DatabaseConnection, sql
from .schemas import (
    CatalogCategory,
    FormField,
    FormOption,
    RequestFormData,
    ServiceTypeOption,
)


def get_catalog(connection: DatabaseConnection) -> list[CatalogCategory]:
    rows = connection.execute(
        sql(
            "SELECT sc.id category_id, sc.name category_name, st.id type_id, st.name type_name FROM service_category sc LEFT JOIN service_type st ON st.id_service_category=sc.id ORDER BY sc.name, st.name"
        )
    ).mappings()
    grouped = {}
    for r in rows:
        item = grouped.setdefault(
            r["category_id"],
            CatalogCategory(
                id=r["category_id"],
                name=r["category_name"] or "Não informado",
                serviceTypes=[],
            ),
        )
        if r["type_id"]:
            item.serviceTypes.append(
                ServiceTypeOption(
                    id=r["type_id"], name=r["type_name"] or "Não informado"
                )
            )
    return list(grouped.values())


def get_request_form(
    connection: DatabaseConnection,
    category: str | None,
    service_type: str | None,
    service_type_id: int | None,
) -> RequestFormData:
    types = (
        connection.execute(
            sql(
                "SELECT st.id, st.name, sc.name category FROM service_type st JOIN service_category sc ON sc.id=st.id_service_category WHERE (:category IS NULL OR sc.name=:category) ORDER BY sc.name, st.name"
            ),
            {"category": category},
        )
        .mappings()
        .all()
    )
    selected = (
        next((r for r in types if service_type_id and r["id"] == service_type_id), None)
        or next((r for r in types if service_type and r["name"] == service_type), None)
        or (types[0] if types else None)
    )
    if not selected:
        return RequestFormData(serviceTypeOptions=[], fields=[])
    fields = connection.execute(
        sql(
            "SELECT id,name,type,options,required FROM service_field_type WHERE active IS TRUE AND id_service_type=:id ORDER BY display_order NULLS LAST,id"
        ),
        {"id": selected["id"]},
    ).mappings()
    mapped = []
    type_map = {
        "SINGLE_SELECT": "select",
        "MULTI_SELECT": "multi-select",
        "NUMBER": "number",
        "DATE": "date",
        "BOOL": "checkbox",
        "MEDIA": "file",
    }
    for r in fields:
        options = r["options"] if isinstance(r["options"], list) else []
        mapped.append(
            FormField(
                label=r["name"],
                name=f'service_field_{r["id"]}',
                type=type_map.get(r["type"].upper(), "text"),
                options=[FormOption(label=str(v), value=str(v)) for v in options]
                or None,
                required=bool(r["required"]),
                fullWidth=r["type"].upper() in ("TEXT", "MEDIA"),
            )
        )
    return RequestFormData(
        serviceCategoryName=selected["category"],
        serviceTypeId=selected["id"],
        serviceTypeName=selected["name"],
        serviceTypeOptions=[
            FormOption(label=r["name"], value=r["name"]) for r in types
        ],
        fields=mapped,
    )


def get_request_media(connection: DatabaseConnection, media_id: int):
    return (
        connection.execute(
            sql(
                "SELECT content,file_name,mime_type FROM service_field_media WHERE id=:id"
            ),
            {"id": media_id},
        )
        .mappings()
        .one_or_none()
    )
