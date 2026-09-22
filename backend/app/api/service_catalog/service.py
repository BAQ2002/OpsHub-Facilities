from ...database import DatabaseConnection, sql
from ..entities import CatalogEntities, RequestFormEntities


def get_catalog(connection: DatabaseConnection) -> CatalogEntities:
    categories = list(connection.execute("SELECT * FROM SERVICE_CATEGORY ORDER BY NAME").mappings())
    services = list(connection.execute("SELECT * FROM SERVICE_TYPE ORDER BY NAME").mappings())
    return CatalogEntities(categories=categories, service_types=services)


def get_request_form(connection: DatabaseConnection, service_type_id: int) -> RequestFormEntities:
    selected = connection.execute(sql("""SELECT to_jsonb(ST) AS service_type,
        to_jsonb(SC) AS category FROM SERVICE_TYPE ST
        JOIN SERVICE_CATEGORY SC ON SC.ID=ST.ID_SERVICE_CATEGORY
        WHERE ST.ID=:service_type_id"""), {"service_type_id": service_type_id}).mappings().one_or_none()
    if not selected:
        return RequestFormEntities(fields=[])
    fields = list(connection.execute(sql("""SELECT * FROM SERVICE_FIELD_TYPE
        WHERE ACTIVE IS TRUE AND ID_SERVICE_TYPE=:id
        ORDER BY DISPLAY_ORDER NULLS LAST,ID"""), {"id": service_type_id}).mappings())
    return RequestFormEntities(**selected, fields=fields)


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
