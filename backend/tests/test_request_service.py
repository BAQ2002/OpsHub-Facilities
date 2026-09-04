import os
import unittest
from datetime import date
from typing import Any

os.environ.setdefault("DATABASE_URL", "postgresql://test:test@localhost/test")

from backend.app.database import QueryResult
from backend.app.api.v1.request.service import get_tracking


class FakeCursor:
    def __init__(self, rows: list[dict[str, Any]]) -> None:
        self.rows = iter(rows)

    def __iter__(self):
        return self.rows

    def fetchone(self):
        return next(self.rows, None)

    def fetchall(self):
        return list(self.rows)


class RecordingConnection:
    def __init__(self, result_sets: list[list[dict[str, Any]]]) -> None:
        self.result_sets = iter(result_sets)
        self.statements: list[str] = []

    def execute(self, statement: str, parameters=None) -> QueryResult:
        self.statements.append(statement)
        return QueryResult(FakeCursor(next(self.result_sets)))


class RequestServiceTests(unittest.TestCase):
    def test_tracking_casts_optional_and_array_parameters(self):
        connection = RecordingConnection(
            [
                [
                    {
                        "total": 0,
                        "in_progress": 0,
                        "average_minutes": None,
                        "critical": 0,
                    }
                ],
                [],
                [],
                [],
                [],
                [],
            ]
        )

        result = get_tracking(
            connection,
            date(2026, 1, 1),
            date(2026, 9, 3),
            None,
            None,
        )

        executed_sql = "\n".join(connection.statements)
        self.assertIn("CAST(%(business)s AS INTEGER) IS NULL", executed_sql)
        self.assertIn("CAST(%(category)s AS INTEGER) IS NULL", executed_sql)
        self.assertIn("ALL(CAST(%(closed)s AS TEXT[]))", executed_sql)
        self.assertIn("ANY(CAST(%(closed)s AS TEXT[]))", executed_sql)
        self.assertIn(
            "TO_CHAR(DATE_TRUNC('month',R.CREATED_DATE),'Mon') AS MONTH",
            executed_sql,
        )
        self.assertIn(
            "FILTER(WHERE RS.DESCRIPTION <> ALL(CAST(%(closed)s AS TEXT[]))) AS OPEN",
            executed_sql,
        )
        self.assertIn(
            "FILTER(WHERE RS.DESCRIPTION = ANY(CAST(%(closed)s AS TEXT[]))) AS CLOSED",
            executed_sql,
        )
        self.assertEqual(result["summaryCards"][0]["value"], "0")


if __name__ == "__main__":
    unittest.main()
