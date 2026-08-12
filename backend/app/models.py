from datetime import datetime
from decimal import Decimal

from sqlalchemy import ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class RequestStatus(Base):
    __tablename__ = "request_status"
    id: Mapped[int] = mapped_column(primary_key=True)
    description: Mapped[str | None] = mapped_column(String(30))
    requests: Mapped[list["Request"]] = relationship(back_populates="status")


class RequestType(Base):
    __tablename__ = "request_type"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str | None] = mapped_column(String(30))
    requests: Mapped[list["Request"]] = relationship(back_populates="request_type")


class ServiceCategory(Base):
    __tablename__ = "service_category"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str | None] = mapped_column(String(100))
    service_types: Mapped[list["ServiceType"]] = relationship(back_populates="category")


class ServiceType(Base):
    __tablename__ = "service_type"
    id: Mapped[int] = mapped_column(primary_key=True)
    id_service_category: Mapped[int | None] = mapped_column(ForeignKey("service_category.id"))
    name: Mapped[str | None] = mapped_column(String(100))
    description: Mapped[str | None] = mapped_column(String(100))
    category: Mapped[ServiceCategory | None] = relationship(back_populates="service_types")
    requests: Mapped[list["Request"]] = relationship(back_populates="service_type")


class Business(Base):
    __tablename__ = "business"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str | None] = mapped_column(String(30))
    regions: Mapped[list["Region"]] = relationship(back_populates="business")


class Region(Base):
    __tablename__ = "region"
    id: Mapped[int] = mapped_column(primary_key=True)
    id_business: Mapped[int | None] = mapped_column(ForeignKey("business.id"))
    name: Mapped[str | None] = mapped_column(String(100))
    business: Mapped[Business | None] = relationship(back_populates="regions")
    locations: Mapped[list["Location"]] = relationship(back_populates="region")


class Location(Base):
    __tablename__ = "location"
    id: Mapped[int] = mapped_column(primary_key=True)
    id_region: Mapped[int | None] = mapped_column(ForeignKey("region.id"))
    name: Mapped[str | None] = mapped_column(String(100))
    location_x: Mapped[Decimal | None] = mapped_column(Numeric(10, 8))
    location_y: Mapped[Decimal | None] = mapped_column(Numeric(11, 8))
    region: Mapped[Region | None] = relationship(back_populates="locations")
    requests: Mapped[list["Request"]] = relationship(back_populates="location")


class Membership(Base):
    __tablename__ = "membership"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str | None] = mapped_column(String(300))
    email: Mapped[str | None] = mapped_column(String(300))
    requested: Mapped[list["Request"]] = relationship(foreign_keys="Request.id_member_requester", back_populates="requester")
    assigned: Mapped[list["Request"]] = relationship(foreign_keys="Request.id_member_responder", back_populates="responder")


class Request(Base):
    __tablename__ = "request"
    id: Mapped[int] = mapped_column(primary_key=True)
    id_request_type: Mapped[int] = mapped_column(ForeignKey("request_type.id"))
    id_member_requester: Mapped[int] = mapped_column(ForeignKey("membership.id"))
    id_member_responder: Mapped[int | None] = mapped_column(ForeignKey("membership.id"))
    id_location: Mapped[int] = mapped_column(ForeignKey("location.id"))
    id_service_type: Mapped[int] = mapped_column(ForeignKey("service_type.id"))
    id_request_status: Mapped[int] = mapped_column(ForeignKey("request_status.id"))
    created_date: Mapped[datetime | None]
    agreed_date: Mapped[datetime | None]
    started_date: Mapped[datetime | None]
    finished_date: Mapped[datetime | None]
    canceled_date: Mapped[datetime | None]
    description: Mapped[str | None] = mapped_column(String(300))
    request_type: Mapped[RequestType] = relationship(back_populates="requests")
    requester: Mapped[Membership] = relationship(foreign_keys=[id_member_requester], back_populates="requested")
    responder: Mapped[Membership | None] = relationship(foreign_keys=[id_member_responder], back_populates="assigned")
    location: Mapped[Location] = relationship(back_populates="requests")
    service_type: Mapped[ServiceType] = relationship(back_populates="requests")
    status: Mapped[RequestStatus] = relationship(back_populates="requests")


class RequestTask(Base):
    __tablename__ = "request_task"
    id: Mapped[int] = mapped_column(primary_key=True)
    id_request: Mapped[int] = mapped_column(ForeignKey("request.id"))
    start_datetime: Mapped[datetime | None]
    stop_datetime: Mapped[datetime | None]
    description: Mapped[str | None] = mapped_column(String(300))
