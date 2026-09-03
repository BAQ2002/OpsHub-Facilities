from ....database import DatabaseConnection
from .schemas import MembershipOption


def get_executor_options(connection: DatabaseConnection) -> list[MembershipOption]:
    rows = connection.execute("SELECT id,name FROM membership ORDER BY name").all()
    return [
        MembershipOption(id=row["id"], name=row["name"] or "Não informado")
        for row in rows
    ]
