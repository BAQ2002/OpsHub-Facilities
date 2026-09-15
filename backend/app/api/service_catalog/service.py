from ...database import DatabaseConnection, sql
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
    service_type_id: int,
) -> RequestFormData:
    selected = (
        connection.execute(
            sql("""SELECT ST.ID,
       ST.NAME,
       SC.NAME CATEGORY
    FROM SERVICE_TYPE ST
        JOIN SERVICE_CATEGORY SC
            ON SC.ID=ST.ID_SERVICE_CATEGORY
    WHERE ST.ID=:service_type_id"""),
            {"service_type_id": service_type_id},
        )
        .mappings()
        .one_or_none()
    )
    if not selected:
        return RequestFormData(fields=[])
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
        field_type = str(r["type"] or "TEXT").upper()
        raw_options = r["options"]
        select_options = raw_options if isinstance(raw_options, list) else []
        media_options = (
            raw_options
            if field_type == "MEDIA" and isinstance(raw_options, dict)
            else None
        )
        mapped.append(
            FormField(
                label=r["name"] or "Campo adicional",
                name=f'service_field_{r["id"]}',
                type=type_map.get(field_type, "text"),
                options=[
                    FormOption(label=str(value), value=str(value))
                    for value in select_options
                ]
                or None,
                required=bool(r["required"]),
                fullWidth=field_type in ("TEXT", "MEDIA"),
                mediaOptions=media_options,
            )
        )
    return RequestFormData(
        serviceCategoryName=selected["category"],
        serviceTypeId=selected["id"],
        serviceTypeName=selected["name"],
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
