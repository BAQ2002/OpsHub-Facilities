from datetime import date

from sqlalchemy.orm import Session

from ..repositories.activity_repository import list_activities
from ..schemas import ActivityRead

ALLOWED_STATUSES = {"Programada", "Em andamento", "Concluída", "Cancelada"}


def get_activities(
    session: Session,
    start_date: date,
    end_date: date,
    statuses: list[str],
    business_units: list[int],
) -> list[ActivityRead]:
    if end_date < start_date:
        raise ValueError("end_date deve ser igual ou posterior a start_date")
    invalid_statuses = set(statuses) - ALLOWED_STATUSES
    if invalid_statuses:
        raise ValueError(f"Status inválido: {', '.join(sorted(invalid_statuses))}")
    if set(business_units) - {1, 2}:
        raise ValueError("business_unit aceita apenas 1 e/ou 2")

    database_statuses = [
        database_status
        for status in statuses
        for database_status in (["Concluída", "Concluida"] if status == "Concluída" else [status])
    ]
    return [ActivityRead.model_validate(row) for row in list_activities(
        session, start_date, end_date, database_statuses, business_units
    )]
