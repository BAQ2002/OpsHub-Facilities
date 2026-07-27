from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class Business(Base):
    __tablename__ = "business"
    id: Mapped[int] = mapped_column("id", primary_key=True)
    name: Mapped[Optional[str]] = mapped_column("name", String(30))
    regions: Mapped[list["Region"]] = relationship(back_populates="business")


class Region(Base):
    __tablename__ = "region"
    id: Mapped[int] = mapped_column("id", primary_key=True)
    business_id: Mapped[Optional[int]] = mapped_column("id_business", ForeignKey("business.id"))
    name: Mapped[Optional[str]] = mapped_column("name", String(100))
    business: Mapped[Optional[Business]] = relationship(back_populates="regions")
    locations: Mapped[list["Location"]] = relationship(back_populates="region")


class Location(Base):
    __tablename__ = "location"
    id: Mapped[int] = mapped_column("id", primary_key=True)
    region_id: Mapped[Optional[int]] = mapped_column("id_region", ForeignKey("region.id"))
    name: Mapped[Optional[str]] = mapped_column("name", String(100))
    location_x: Mapped[Optional[Decimal]] = mapped_column("location_x")
    location_y: Mapped[Optional[Decimal]] = mapped_column("location_y")
    region: Mapped[Optional[Region]] = relationship(back_populates="locations")
    requests: Mapped[list["Request"]] = relationship(back_populates="location")


class Membership(Base):
    __tablename__ = "membership"
    id: Mapped[int] = mapped_column("id", primary_key=True)
    name: Mapped[Optional[str]] = mapped_column("name", String(300))
    email: Mapped[Optional[str]] = mapped_column("email", String(300))
    requested: Mapped[list["Request"]] = relationship(foreign_keys="Request.requester_id", back_populates="requester")
    assigned: Mapped[list["Request"]] = relationship(foreign_keys="Request.responder_id", back_populates="responder")


class RequestStatus(Base):
    __tablename__ = "request_status"
    id: Mapped[int] = mapped_column("id", primary_key=True)
    description: Mapped[Optional[str]] = mapped_column("description", String(30))
    requests: Mapped[list["Request"]] = relationship(back_populates="status")


class RequestType(Base):
    __tablename__ = "request_type"
    id: Mapped[int] = mapped_column("id", primary_key=True)
    name: Mapped[Optional[str]] = mapped_column("name", String(30))
    requests: Mapped[list["Request"]] = relationship(back_populates="request_type")


class ServiceCategory(Base):
    __tablename__ = "service_category"
    id: Mapped[int] = mapped_column("id", primary_key=True)
    name: Mapped[Optional[str]] = mapped_column("name", String(100))
    service_types: Mapped[list["ServiceType"]] = relationship(back_populates="category")


class ServiceType(Base):
    __tablename__ = "service_type"
    id: Mapped[int] = mapped_column("id", primary_key=True)
    category_id: Mapped[Optional[int]] = mapped_column("id_service_category", ForeignKey("service_category.id"))
    name: Mapped[Optional[str]] = mapped_column("name", String(100))
    description: Mapped[Optional[str]] = mapped_column("description", String(100))
    category: Mapped[Optional[ServiceCategory]] = relationship(back_populates="service_types")
    requests: Mapped[list["Request"]] = relationship(back_populates="service_type")


class Request(Base):
    __tablename__ = "request"
    id: Mapped[int] = mapped_column("id", primary_key=True)
    request_type_id: Mapped[int] = mapped_column("id_request_type", ForeignKey("request_type.id"))
    requester_id: Mapped[int] = mapped_column("id_member_requester", ForeignKey("membership.id"))
    responder_id: Mapped[Optional[int]] = mapped_column("id_member_responder", ForeignKey("membership.id"))
    location_id: Mapped[int] = mapped_column("id_location", ForeignKey("location.id"))
    service_type_id: Mapped[int] = mapped_column("id_service_type", ForeignKey("service_type.id"))
    status_id: Mapped[int] = mapped_column("id_request_status", ForeignKey("request_status.id"))
    created_date: Mapped[Optional[datetime]] = mapped_column("created_date")
    agreed_date: Mapped[Optional[datetime]] = mapped_column("agreed_date")
    started_date: Mapped[Optional[datetime]] = mapped_column("started_date")
    finished_date: Mapped[Optional[datetime]] = mapped_column("finished_date")
    canceled_date: Mapped[Optional[datetime]] = mapped_column("canceled_date")
    description: Mapped[Optional[str]] = mapped_column("description", String(300))
    request_type: Mapped[RequestType] = relationship(back_populates="requests")
    requester: Mapped[Membership] = relationship(foreign_keys=[requester_id], back_populates="requested")
    responder: Mapped[Optional[Membership]] = relationship(foreign_keys=[responder_id], back_populates="assigned")
    location: Mapped[Location] = relationship(back_populates="requests")
    service_type: Mapped[ServiceType] = relationship(back_populates="requests")
    status: Mapped[RequestStatus] = relationship(back_populates="requests")
