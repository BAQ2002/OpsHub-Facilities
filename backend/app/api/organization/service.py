from ...database import DatabaseConnection
from ..entities import OrganizationEntities


def get_location_hierarchy(connection: DatabaseConnection) -> OrganizationEntities:
    return OrganizationEntities(
        businesses=list(connection.execute("SELECT * FROM OHFC_BUSINESS ORDER BY NAME").mappings()),
        regions=list(connection.execute("SELECT * FROM OHFC_REGION ORDER BY NAME").mappings()),
        locations=list(connection.execute("SELECT * FROM OHFC_LOCATION ORDER BY NAME").mappings()),
    )
