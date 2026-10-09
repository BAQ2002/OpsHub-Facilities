from datetime import date
from typing import Literal
from fastapi import APIRouter, Depends, HTTPException, Query, status
from ...database import DatabaseConnection, get_connection, settings
from .schemas import CreateRequest, ActivityPage, ActivityMapRecord, ActivityBusinessCount, UpdateRequestStatus
from ..entities import BoardEntities, RequestContext, RequestDetailsEntities, BoardColumnEntities
from .service import (create_request, get_activities, get_my_requests,
                      get_activity_page, get_activity_map, get_activity_business_counts)

router = APIRouter()


@router.get("/report")
def report(
    start_date: date,
    end_date: date,
    search: str | None = Query(default=None, max_length=200),
    business_id: int | None = Query(default=None, gt=0),
    service_category_ids: list[int] = Query(default=[]),
    status_ids: list[int] = Query(default=[]),
    connection: DatabaseConnection = Depends(get_connection),
):
    from fastapi.responses import Response
    from .report import build_report
    from .report_data import collect_report

    if end_date < start_date or end_date.year == 9999 or any(i <= 0 for i in service_category_ids + status_ids):
        raise HTTPException(422, "Período ou filtros inválidos.")
    try:
        data = collect_report(connection, start_date, end_date, search, business_id, service_category_ids, status_ids)
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc
    records = data["records"]
    def labels(group):
        return ", ".join(sorted({(r.get(group) or {}).get("name") or "Não informado" for r in records}))
    description = "; ".join([
        "Unidade: " + (labels("business") if business_id else "Todas"),
        "Categorias: " + (labels("category") if service_category_ids else "Todas"),
        "Status: " + (", ".join(sorted({r["request_status"]["description"] for r in records})) if status_ids else "Todos"),
        "Busca: " + (search.strip() if search and search.strip() else "Não aplicada"),
    ])
    content = build_report(data, start_date, end_date, description)
    return Response(content, media_type="application/pdf", headers={
        "Content-Disposition": f'attachment; filename="relatorio_chamados_{start_date}_a_{end_date}.pdf"',
        "Cache-Control": "no-store",
    })


@router.patch("/{request_id}/status", status_code=status.HTTP_204_NO_CONTENT)
def change_status(request_id: int, data: UpdateRequestStatus,
                  connection: DatabaseConnection = Depends(get_connection)):
    from .service import update_request_status
    try:
        update_request_status(connection, request_id, data.statusId)
    except LookupError as exc:
        raise HTTPException(404, str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc


@router.get("/mine", response_model=list[RequestContext])
def mine(connection: DatabaseConnection = Depends(get_connection)):
    return get_my_requests(connection, settings.current_member_id)


@router.post("", status_code=status.HTTP_201_CREATED)
def create(
    data: CreateRequest, connection: DatabaseConnection = Depends(get_connection)
):
    try:
        return {"id": create_request(connection, data)}
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc


@router.get("/activities", response_model=list[RequestContext])
def activities(
    start_date: date,
    end_date: date,
    status: list[str] = Query(default=[]),
    business_unit: list[int] = Query(default=[]),
    connection: DatabaseConnection = Depends(get_connection),
):
    return get_activities(connection, start_date, end_date, status, business_unit)


@router.get("/home-metrics")
def home_metrics(
    start_date: date,
    end_date: date,
    connection: DatabaseConnection = Depends(get_connection),
):
    from .service import get_home_metrics

    return get_home_metrics(connection, start_date, end_date)


@router.get("/filter-options")
def filter_options(connection: DatabaseConnection = Depends(get_connection)):
    from .service import get_filter_options
    return get_filter_options(connection)


@router.get("/activity-tracking")
def activity_tracking(
    start_date: date,
    end_date: date,
    business_id: int | None = None,
    service_category_id: int | None = None,
    service_category_ids: list[int] = Query(default=[]),
    status_ids: list[int] = Query(default=[]),
    connection: DatabaseConnection = Depends(get_connection),
):
    from .service import get_tracking

    return get_tracking(
        connection, start_date, end_date, business_id, service_category_id, service_category_ids, status_ids
    )


@router.get("/board", response_model=BoardEntities)
def board(start_date: date, end_date: date,
          search: str | None = Query(default=None, max_length=200), business_id: int | None = None,
          service_category_ids: list[int] = Query(default=[]),
          page_size: int = Query(default=10, ge=1, le=50), sort: Literal["recent"] = "recent",
          connection: DatabaseConnection = Depends(get_connection)):
    from .service import get_board
    if end_date < start_date:
        raise HTTPException(422, "Intervalo inválido.")
    return get_board(connection, start_date, end_date, search, business_id, service_category_ids, page_size, sort)


@router.get("/board/columns/{status_id}", response_model=BoardColumnEntities)
def board_column(status_id: int, start_date: date, end_date: date,
                 search: str | None = Query(default=None, max_length=200), business_id: int | None = None,
                 service_category_ids: list[int] = Query(default=[]),
                 offset: int = Query(default=0, ge=0, le=2147483647),
                 page_size: int = Query(default=10, ge=1, le=50), sort: Literal["recent"] = "recent",
                 connection: DatabaseConnection = Depends(get_connection)):
    from .service import get_board_column
    if status_id <= 0 or end_date < start_date:
        raise HTTPException(422, "Status ou intervalo inválido.")
    return get_board_column(connection, status_id, start_date, end_date, search, business_id,
                            service_category_ids, offset, page_size, sort)


@router.get("/activities/page", response_model=ActivityPage)
def activity_page(
    start_date: date,
    end_date: date,
    status: list[str] = Query(default=[]),
    business_name: str | None = Query(default=None, max_length=200),
    page: int = Query(default=1, ge=1, le=2147483647),
    page_size: int = Query(default=30, ge=1, le=90),
    connection: DatabaseConnection = Depends(get_connection),
):
    if end_date < start_date:
        raise HTTPException(422, "O fim do período deve ser igual ou posterior ao início.")
    return get_activity_page(connection, start_date, end_date, status, business_name, page, page_size)


@router.get("/activities/map", response_model=list[ActivityMapRecord])
def activity_map(
    start_date: date,
    end_date: date,
    status: list[str] = Query(default=[]),
    connection: DatabaseConnection = Depends(get_connection),
):
    return get_activity_map(connection, start_date, end_date, status)


@router.get("/activities/business-counts", response_model=list[ActivityBusinessCount])
def activity_business_counts(
    start_date: date,
    end_date: date,
    status: list[str] = Query(default=[]),
    connection: DatabaseConnection = Depends(get_connection),
):
    return get_activity_business_counts(connection, start_date, end_date, status)


@router.get("/{request_id}/details", response_model=RequestDetailsEntities)
def request_details(request_id: int, connection: DatabaseConnection = Depends(get_connection)):
    from .service import get_request_details
    if request_id <= 0:
        raise HTTPException(400, "Identificador de solicitação inválido.")
    result = get_request_details(connection, request_id)
    if result is None:
        raise HTTPException(404, "Solicitação não encontrada.")
    return result
