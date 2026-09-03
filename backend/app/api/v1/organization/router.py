from fastapi import APIRouter, Depends
from ....database import DatabaseConnection, get_connection
from .schemas import LocationHierarchy
from .service import get_location_hierarchy

router = APIRouter()


@router.get("/locations", response_model=LocationHierarchy)
def location_hierarchy(connection: DatabaseConnection = Depends(get_connection)):
    return get_location_hierarchy(connection)
