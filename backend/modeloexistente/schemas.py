# backend/app/api/v1/gate/schemas.py

from datetime import datetime
from pydantic import BaseModel, Field


class GateOverview(BaseModel):
    """Resumo rápido da operação de Gate."""
    trucks_in_queue: int = Field(..., description="Quantidade de caminhões na fila externa/interna")
    avg_wait_time_min: float = Field(..., description="Tempo médio de espera (minutos)")
    trucks_processed_last_hour: int = Field(..., description="Caminhões processados na última hora")
    gate_status: str = Field(..., description="Status geral do gate (ex.: NORMAL, LENTO, CRÍTICO)")
    as_of: datetime = Field(..., description="Data/hora de referência dos dados (UTC)")


class AutoGateStatus(BaseModel):
    """Status do AutoGate para um dia."""
    dia: str                          # "YYYY-MM-DD"
    autogate_in: float | None = None  # percentual Gate IN (ex: 97.40)
    autogate_out: float | None = None # percentual Gate OUT
    erro_camera: int = 0
    motorista_errado: int = 0
    agendamento_vencido: int = 0
    sem_prosicao_fld: int = 0
    faltou_inspecao: int = 0
    container_pontilhado: int = 0
    problema_booking: int = 0
    sem_biometria: int = 0
    motoristas_cadastrados: int = 0


class GateAgendamentoRow(BaseModel):
    """Linha de agendamento por faina/hora/tipo."""
    ordem: int
    tipo: str            # "Capacidade" | "Agendados" | "Atendidos"
    faina_id: int
    dsc_faina: str
    dat: str             # "YYYY-MM-DD"
    hora: int            # 0-23
    qtd: int
