from pydantic import BaseModel


class BusinessOption(BaseModel):
    id: int
    name: str


class RegionOption(BaseModel):
    id: int
    businessId: int
    name: str


class LocationOption(BaseModel):
    id: int
    regionId: int
    name: str


class LocationHierarchy(BaseModel):
    businesses: list[BusinessOption]
    regions: list[RegionOption]
    locations: list[LocationOption]
