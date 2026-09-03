import re
from collections.abc import Generator, Iterator, Mapping
from typing import Any

from psycopg import Connection
from psycopg.rows import dict_row
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str
    model_config = SettingsConfigDict(env_file=(".env", ".env.local"), extra="ignore")


settings = Settings()


def _psycopg_url(database_url: str) -> str:
    """Accept the previous driver-qualified URLs during environment migration."""
    return database_url.replace("postgresql+psycopg://", "postgresql://", 1)


_NAMED_PARAMETER = re.compile(r"(?<!:):([a-zA-Z_][a-zA-Z0-9_]*)")


def sql(statement: str) -> str:
    """Translate the API's named parameters to psycopg's mapping syntax."""
    return _NAMED_PARAMETER.sub(r"%(\1)s", statement)


class QueryResult:
    """Small result facade used by services while psycopg owns query execution."""

    def __init__(self, cursor: Any) -> None:
        self._cursor = cursor

    def __iter__(self) -> Iterator[dict[str, Any]]:
        return iter(self._cursor)

    def mappings(self) -> "QueryResult":
        return self

    def all(self) -> list[dict[str, Any]]:
        return self._cursor.fetchall()

    def one(self) -> dict[str, Any]:
        row = self.one_or_none()
        if row is None:
            raise LookupError("A consulta não retornou nenhum resultado.")
        return row

    def one_or_none(self) -> dict[str, Any] | None:
        row = self._cursor.fetchone()
        if row is not None and self._cursor.fetchone() is not None:
            raise LookupError("A consulta retornou mais de um resultado.")
        return row

    def scalars(self) -> Iterator[Any]:
        return (next(iter(row.values())) for row in self._cursor)

    def scalar_one(self) -> Any:
        row = self.one()
        return next(iter(row.values()))

    def scalar_one_or_none(self) -> Any | None:
        row = self.one_or_none()
        return next(iter(row.values())) if row is not None else None


class DatabaseConnection:
    """Application-facing connection backed directly by psycopg."""

    def __init__(self, connection: Connection[dict[str, Any]]) -> None:
        self._connection = connection

    def execute(
        self, statement: str, parameters: Mapping[str, Any] | None = None
    ) -> QueryResult:
        cursor = self._connection.execute(statement, parameters)
        return QueryResult(cursor)

    def commit(self) -> None:
        self._connection.commit()

    def rollback(self) -> None:
        self._connection.rollback()


def get_connection() -> Generator[DatabaseConnection, None, None]:
    with Connection.connect(
        _psycopg_url(settings.database_url), row_factory=dict_row
    ) as connection:
        yield DatabaseConnection(connection)


def commit_connection(connection: DatabaseConnection) -> None:
    """Commit a unit of work, rolling it back when persistence fails."""
    try:
        connection.commit()
    except Exception:
        connection.rollback()
        raise
