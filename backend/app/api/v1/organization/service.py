from ....database import DatabaseConnection
from .schemas import BusinessOption, LocationHierarchy, LocationOption, RegionOption


def get_location_hierarchy(connection: DatabaseConnection) -> LocationHierarchy:
    businesses = connection.execute("""SELECT ID,
       NAME
    FROM BUSINESS
    ORDER BY NAME""").all()
    regions = connection.execute("""SELECT ID,
       ID_BUSINESS,
       NAME
    FROM REGION
    ORDER BY NAME""").all()
    locations = connection.execute("""SELECT ID,
       ID_REGION,
       NAME
    FROM LOCATION
    ORDER BY NAME""").all()
    return LocationHierarchy(
        businesses=[
            BusinessOption(id=r["id"], name=r["name"] or "Não informado")
            for r in businesses
        ],
        regions=[
            RegionOption(
                id=r["id"],
                businessId=r["id_business"],
                name=r["name"] or "Não informado",
            )
            for r in regions
            if r["id_business"]
        ],
        locations=[
            LocationOption(
                id=r["id"],
                regionId=r["id_region"],
                name=r["name"] or "Não informado",
            )
            for r in locations
            if r["id_region"]
        ],
    )
