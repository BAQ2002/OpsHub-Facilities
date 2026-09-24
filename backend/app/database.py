"""Oracle 19c connections and application result contract."""
import json
from collections.abc import Generator, Iterator, Mapping
from decimal import Decimal
from typing import Any

import oracledb
from pydantic import PositiveInt, SecretStr, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    oracle_user: str = ""
    oracle_password: SecretStr = SecretStr("")
    oracle_dsn: str = ""
    oracle_pool_min: PositiveInt = 1
    oracle_pool_max: PositiveInt = 5
    oracle_call_timeout_ms: PositiveInt = 30000
    current_member_id: PositiveInt = 1
    model_config = SettingsConfigDict(env_file=(".env", ".env.local"), extra="ignore")

    @model_validator(mode="after")
    def pool_limits(self):
        if self.oracle_pool_max < self.oracle_pool_min:
            raise ValueError("ORACLE_POOL_MAX deve ser maior ou igual a ORACLE_POOL_MIN.")
        return self


settings = Settings()
_pool = None


def _initialize_session(connection, requested_tag):
    with connection.cursor() as cursor:
        cursor.execute("ALTER SESSION SET NLS_NUMERIC_CHARACTERS = '.,'")


def open_pool() -> None:
    global _pool
    if not all((settings.oracle_user, settings.oracle_password.get_secret_value(), settings.oracle_dsn)):
        raise ValueError("Configure ORACLE_USER, ORACLE_PASSWORD e ORACLE_DSN.")
    _pool = oracledb.create_pool(
        user=settings.oracle_user, password=settings.oracle_password.get_secret_value(),
        dsn=settings.oracle_dsn, min=settings.oracle_pool_min, max=settings.oracle_pool_max,
        increment=1, getmode=oracledb.POOL_GETMODE_TIMEDWAIT, wait_timeout=10000,
        session_callback=_initialize_session,
    )


def close_pool() -> None:
    global _pool
    if _pool is not None:
        _pool.close()
        _pool = None


def sql(statement: str) -> str:
    """Oracle accepts the named binds used by the services directly."""
    return statement


def encode_json(value: Any) -> str:
    # Always wrap, even objects: avoids collisions with a user's own 'value' key.
    return json.dumps({"value": value}, ensure_ascii=False, allow_nan=False)


def decode_row(columns, values) -> dict[str, Any]:
    result = {}
    for name, value in zip(columns, values):
        name = name.lower()
        if isinstance(value, oracledb.LOB):
            value = value.read()
        field = name.split("__")[-1]
        if field in ("options", "value") and isinstance(value, (str, dict)):
            envelope = json.loads(value) if isinstance(value, str) else value
            if not isinstance(envelope, dict) or set(envelope) != {"value"}:
                raise ValueError("JSON persistido deve usar o envelope {value: ...}.")
            value = envelope["value"]
        if "__" in name:
            group, field = name.split("__", 1)
            result.setdefault(group, {})[field] = value
        else:
            result[name] = value
    for key, value in result.items():
        if isinstance(value, dict) and "id" in value and value["id"] is None and any(c.lower().startswith(key + "__") for c in columns):
            result[key] = None
    return result


def _output_type(cursor, metadata):
    # Coordinates must never pass through a binary float.
    if metadata.type_code == oracledb.DB_TYPE_NUMBER and metadata.name.lower().split("__")[-1] in ("location_x", "location_y"):
        return cursor.var(oracledb.DB_TYPE_VARCHAR, arraysize=cursor.arraysize, outconverter=Decimal)


class QueryResult:
    """Materialized rows allow nested queries without retaining Oracle cursors."""
    def __init__(self, rows) -> None:
        self._rows = iter(rows.fetchall() if hasattr(rows, "fetchall") else rows)

    def __iter__(self) -> Iterator[dict[str, Any]]:
        return self._rows

    def mappings(self):
        return self

    def all(self):
        return list(self._rows)

    def one(self):
        row = self.one_or_none()
        if row is None:
            raise LookupError("A consulta não retornou nenhum resultado.")
        return row

    def one_or_none(self):
        row = next(self._rows, None)
        if row is not None and next(self._rows, None) is not None:
            raise LookupError("A consulta retornou mais de um resultado.")
        return row

    def scalars(self):
        return (next(iter(row.values())) for row in self._rows)

    def scalar_one(self):
        return next(iter(self.one().values()))

    def scalar_one_or_none(self):
        row = self.one_or_none()
        return next(iter(row.values())) if row is not None else None


class DatabaseConnection:
    def __init__(self, connection) -> None:
        self._connection = connection

    def _execute(self, cursor, statement, parameters):
        cursor.prepare(statement)
        names = {name.lower() for name in cursor.bindnames()}
        params = {key: int(value) if isinstance(value, bool) else value
                  for key, value in (parameters or {}).items() if key.lower() in names}
        types = {}
        for key in params:
            if key in ("range_start", "range_end"):
                types[key] = oracledb.DB_TYPE_TIMESTAMP
            elif key == "value":
                types[key] = oracledb.DB_TYPE_CLOB
            elif key == "content":
                types[key] = oracledb.DB_TYPE_BLOB
            elif key in ("business", "category", "rented"):
                types[key] = oracledb.DB_TYPE_NUMBER
        cursor.setinputsizes(**types)
        cursor.execute(None, params)

    def execute(self, statement: str, parameters: Mapping[str, Any] | None = None) -> QueryResult:
        with self._connection.cursor() as cursor:
            cursor.outputtypehandler = _output_type
            self._execute(cursor, statement, parameters)
            if cursor.description is None:
                return QueryResult([])
            columns = [column[0] for column in cursor.description]
            return QueryResult([decode_row(columns, row) for row in cursor.fetchall()])

    def insert_id(self, statement: str, parameters: Mapping[str, Any]) -> int:
        with self._connection.cursor() as cursor:
            output = cursor.var(oracledb.DB_TYPE_NUMBER)
            self._execute(cursor, statement, dict(parameters, new_id=output))
            values = output.getvalue()
            if not values or len(values) != 1:
                raise LookupError("A inserção não retornou exatamente um ID.")
            return int(values[0])

    def commit(self):
        self._connection.commit()

    def rollback(self):
        self._connection.rollback()


def get_connection() -> Generator[DatabaseConnection, None, None]:
    if _pool is None:
        raise RuntimeError("Pool Oracle não inicializado.")
    with _pool.acquire() as raw:
        raw.call_timeout = settings.oracle_call_timeout_ms
        connection = DatabaseConnection(raw)
        try:
            yield connection
        finally:
            # Uncommitted writes are never returned to the pool.
            connection.rollback()


def commit_connection(connection):
    try:
        connection.commit()
    except Exception:
        connection.rollback()
        raise
