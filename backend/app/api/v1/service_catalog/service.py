from ....database import DatabaseConnection, sql
from .schemas import (
    CatalogCategory,
    FormField,
    FormOption,
    RequestFormData,
    ServiceTypeOption,
)


def get_catalog(connection: DatabaseConnection) -> list[CatalogCategory]:
    rows = connection.execute(sql("""SELECT SC.ID CATEGORY_ID,
       SC.NAME CATEGORY_NAME,
       ST.ID TYPE_ID,
       ST.NAME TYPE_NAME
    FROM SERVICE_CATEGORY SC
        LEFT JOIN SERVICE_TYPE ST
            ON ST.ID_SERVICE_CATEGORY=SC.ID
    ORDER BY SC.NAME, ST.NAME""")).mappings()
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
            sql("""SELECT ST.ID,
       ST.NAME,
       SC.NAME CATEGORY
    FROM SERVICE_TYPE ST
        JOIN SERVICE_CATEGORY SC
            ON SC.ID=ST.ID_SERVICE_CATEGORY
    WHERE (:category IS NULL OR SC.NAME=:category)
    ORDER BY SC.NAME, ST.NAME"""),
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
        sql("""SELECT ID,
       NAME,
       TYPE,
       OPTIONS,
       REQUIRED
    FROM SERVICE_FIELD_TYPE
    WHERE ACTIVE IS TRUE AND ID_SERVICE_TYPE=:id
    ORDER BY DISPLAY_ORDER NULLS LAST,ID"""),
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
            sql("""SELECT CONTENT,
       FILE_NAME,
       MIME_TYPE
    FROM SERVICE_FIELD_MEDIA
    WHERE ID=:id"""),
            {"id": media_id},
        )
        .mappings()
        .one_or_none()
    )
