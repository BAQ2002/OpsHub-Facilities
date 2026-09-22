from ...database import DatabaseConnection
from ..entities import MemberSummary


def get_executor_options(connection: DatabaseConnection) -> list[MemberSummary]:
    rows = connection.execute("""SELECT ID,
       NAME
    FROM MEMBERSHIP
    ORDER BY NAME""").all()
    return [
        MemberSummary(id=row["id"], name=row["name"])
        for row in rows
    ]
