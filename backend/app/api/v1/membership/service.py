from sqlalchemy import select
from sqlalchemy.orm import Session
from ....models import Membership
from .schemas import MembershipOption


def get_executor_options(session: Session) -> list[MembershipOption]:
    rows = session.execute(
        select(Membership.id, Membership.name).order_by(Membership.name)
    ).all()
    return [
        MembershipOption(id=row.id, name=row.name or "Não informado") for row in rows
    ]
