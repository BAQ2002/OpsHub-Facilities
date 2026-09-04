from ....database import DatabaseConnection
from .schemas import MembershipOption


def get_executor_options(connection: DatabaseConnection) -> list[MembershipOption]:
    rows = connection.execute("""SELECT ID,
       NAME
    FROM MEMBERSHIP
    ORDER BY NAME""").all()
    return [
        MembershipOption(id=row["id"], name=row["name"] or "Não informado")
        for row in rows
    ]
