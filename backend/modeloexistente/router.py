# backend/app/api/v1/gate/router.py

from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse

from .service import (
    get_gate_overview,
    get_gate_agendamentos_db,
    get_autogate_status_db,
    get_agendamentos_analise,
    get_agendamentos_resumo_faina,
    get_agendamentos_heatmap,
    get_agendamentos_lib_especial,
    get_agendamentos_lib_por_usuario,
    get_proximas_retiradas,
)
from .schemas import GateOverview, GateAgendamentoRow, AutoGateStatus

router = APIRouter()


@router.get(
    "/overview",
    response_model=GateOverview,
    summary="Resumo operacional do Gate",
    description="Retorna um overview rápido da operação de Gate (mock, por enquanto).",
)
def gate_overview():
    return get_gate_overview()


@router.get(
    "/agendamentos",
    response_model=List[GateAgendamentoRow],
    summary="Agendamentos por faina, hora e tipo",
    description="Retorna Capacidade, Agendados e Atendidos por faina/hora para um intervalo de datas.",
)
def gate_agendamentos(
    dat_ini: str = Query(..., description="Data início (YYYY-MM-DD)"),
    dat_fim: str = Query(..., description="Data fim (YYYY-MM-DD)"),
):
    return get_gate_agendamentos_db(dat_ini, dat_fim)


@router.get("/agendamentos/analise")
def gate_agendamentos_analise(
    dat_ini: str = Query(..., description="YYYY-MM-DD"),
    dat_fim: str = Query(..., description="YYYY-MM-DD"),
):
    return get_agendamentos_analise(dat_ini, dat_fim)


@router.get("/agendamentos/resumo-faina")
def gate_agendamentos_resumo_faina(
    dat_ini: str = Query(..., description="YYYY-MM-DD"),
    dat_fim: str = Query(..., description="YYYY-MM-DD"),
):
    return get_agendamentos_resumo_faina(dat_ini, dat_fim)


@router.get("/agendamentos/heatmap")
def gate_agendamentos_heatmap(
    dat_ini: str = Query(..., description="YYYY-MM-DD"),
    dat_fim: str = Query(..., description="YYYY-MM-DD"),
):
    return get_agendamentos_heatmap(dat_ini, dat_fim)


@router.get("/agendamentos/lib-especial")
def gate_lib_especial(
    dat_ini: str = Query(..., description="YYYY-MM-DD"),
    dat_fim: str = Query(..., description="YYYY-MM-DD"),
):
    return get_agendamentos_lib_especial(dat_ini, dat_fim)


@router.get("/agendamentos/lib-por-usuario")
def gate_lib_por_usuario(
    dat_ini: str = Query(..., description="YYYY-MM-DD"),
    dat_fim: str = Query(..., description="YYYY-MM-DD"),
):
    return get_agendamentos_lib_por_usuario(dat_ini, dat_fim)


@router.get("/agendamentos/proximas-retiradas")
def gate_proximas_retiradas():
    return get_proximas_retiradas()


@router.get(
    "/autogate",
    response_model=Optional[AutoGateStatus],
    summary="Status do AutoGate (IN/OUT e causas de falha)",
)
def gate_autogate(
    dat: str = Query(default=None, description="Data (YYYY-MM-DD). Padrão: hoje"),
):
    if not dat:
        dat = date.today().isoformat()
    result = get_autogate_status_db(dat)
    if result is None:
        return JSONResponse(content=None, status_code=200)
    return result
