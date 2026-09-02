from sqlalchemy import select
from sqlalchemy.orm import Session
from ....models import Business, Location, Region
from .schemas import BusinessOption, LocationHierarchy, LocationOption, RegionOption


def get_location_hierarchy(session: Session) -> LocationHierarchy:
    businesses = session.execute(
        select(Business.id, Business.name).order_by(Business.name)
    ).all()
    regions = session.execute(
        select(Region.id, Region.id_business, Region.name).order_by(Region.name)
    ).all()
    locations = session.execute(
        select(Location.id, Location.id_region, Location.name).order_by(Location.name)
    ).all()
    return LocationHierarchy(
        businesses=[
            BusinessOption(id=r.id, name=r.name or "Não informado") for r in businesses
        ],
        regions=[
            RegionOption(
                id=r.id, businessId=r.id_business, name=r.name or "Não informado"
            )
            for r in regions
            if r.id_business
        ],
        locations=[
            LocationOption(
                id=r.id, regionId=r.id_region, name=r.name or "Não informado"
            )
            for r in locations
            if r.id_region
        ],
    )
