from ...database import DatabaseConnection
from ..entities import OrganizationEntities


def get_location_hierarchy(connection: DatabaseConnection) -> OrganizationEntities:
    return OrganizationEntities(
        businesses=list(connection.execute("SELECT * FROM BUSINESS ORDER BY NAME").mappings()),
        regions=list(connection.execute("SELECT * FROM REGION ORDER BY NAME").mappings()),
        locations=list(connection.execute("SELECT * FROM LOCATION ORDER BY NAME").mappings()),
    )
