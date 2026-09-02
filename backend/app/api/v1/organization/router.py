from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ....database import get_session
from .schemas import LocationHierarchy
from .service import get_location_hierarchy

router = APIRouter()


@router.get("/locations", response_model=LocationHierarchy)
def location_hierarchy(session: Session = Depends(get_session)):
    return get_location_hierarchy(session)
