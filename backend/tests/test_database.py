import os
import unittest
from typing import Any

os.environ.setdefault("DATABASE_URL", "postgresql://test:test@localhost/test")

from backend.app.database import DatabaseConnection, QueryResult, sql


class FakeCursor:
    def __init__(self, rows: list[dict[str, Any]]) -> None:
        self.rows = iter(rows)

    def __iter__(self):
        return self.rows

    def fetchone(self):
        return next(self.rows, None)

    def fetchall(self):
        return list(self.rows)


class FakeConnection:
    def __init__(self, rows: list[dict[str, Any]]) -> None:
        self.cursor = FakeCursor(rows)
        self.execution = None

    def execute(self, statement, parameters):
        self.execution = (statement, parameters)
        return self.cursor

    def commit(self):
        pass

    def rollback(self):
        pass


class DatabaseTests(unittest.TestCase):
    def test_sql_translates_named_parameters_without_changing_postgres_casts(self):
        statement = sql("SELECT :value::integer, :other_value")

        self.assertEqual(statement, "SELECT %(value)s::integer, %(other_value)s")

    def test_connection_executes_with_mapping_parameters(self):
        raw_connection = FakeConnection([{"id": 42}])
        connection = DatabaseConnection(raw_connection)

        result = connection.execute(
            sql("SELECT id FROM request WHERE id=:id"), {"id": 42}
        )

        self.assertEqual(
            raw_connection.execution,
            ("SELECT id FROM request WHERE id=%(id)s", {"id": 42}),
        )
        self.assertEqual(result.scalar_one(), 42)

    def test_result_exposes_dictionary_rows_and_scalar_values(self):
        rows = [{"id": 1, "name": "A"}, {"id": 2, "name": "B"}]

        self.assertEqual(QueryResult(FakeCursor(rows)).all(), rows)
        self.assertEqual(list(QueryResult(FakeCursor(rows)).scalars()), [1, 2])

    def test_optional_result_returns_none_for_no_rows(self):
        self.assertIsNone(QueryResult(FakeCursor([])).one_or_none())
        self.assertIsNone(QueryResult(FakeCursor([])).scalar_one_or_none())


if __name__ == "__main__":
    unittest.main()
