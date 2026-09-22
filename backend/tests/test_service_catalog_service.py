import os
import unittest
from typing import Any

os.environ.setdefault("DATABASE_URL", "postgresql://test:test@localhost/test")

from backend.app.api.service_catalog.service import get_request_form
from backend.app.database import QueryResult


class FakeCursor:
    def __init__(self, rows: list[dict[str, Any]]) -> None:
        self.rows = iter(rows)

    def __iter__(self):
        return self.rows

    def fetchall(self):
        return list(self.rows)

    def fetchone(self):
        return next(self.rows, None)


class RecordingConnection:
    def __init__(self, result_sets: list[list[dict[str, Any]]]) -> None:
        self.result_sets = iter(result_sets)
        self.executions = []

    def execute(self, statement: str, parameters=None) -> QueryResult:
        self.executions.append((statement, parameters))
        return QueryResult(FakeCursor(next(self.result_sets)))


class ServiceCatalogServiceTests(unittest.TestCase):
    def test_request_form_preserves_persisted_media_configuration(self):
        connection = RecordingConnection(
            [
                [{"service_type": {"id": 2, "id_service_category": 1, "name": "Outros", "description": None}, "category": {"id": 1, "name": "ARTÍFICE"}}],
                [
                    {
                        "id": 2,
                        "id_service_type": 2,
                        "active": True,
                        "display_order": 1,
                        "name": "Foto da necessidade",
                        "type": "MEDIA",
                        "options": {"multiple": True, "accept": ["image/*", "video/*"]},
                        "required": True,
                    }
                ],
            ]
        )

        result = get_request_form(connection, 2)

        self.assertEqual(result.service_type.id, 2)
        self.assertIn("WHERE ST.ID=%(service_type_id)s", connection.executions[0][0])
        self.assertEqual(connection.executions[0][1], {"service_type_id": 2})
        self.assertEqual(result.fields[0].type, "MEDIA")
        self.assertEqual(
            result.fields[0].options,
            {"multiple": True, "accept": ["image/*", "video/*"]},
        )
        self.assertEqual(result.fields[0].id_service_type, 2)

    def test_request_form_tolerates_nullable_legacy_metadata(self):
        connection = RecordingConnection(
            [
                [{"service_type": {"id": 2, "id_service_category": 1, "name": "Outros", "description": None}, "category": {"id": 1, "name": "ARTÍFICE"}}],
                [
                    {
                        "id": 2,
                        "id_service_type": 2,
                        "active": True,
                        "display_order": 1,
                        "name": None,
                        "type": None,
                        "options": None,
                        "required": None,
                    }
                ],
            ]
        )

        result = get_request_form(connection, 2)

        self.assertIsNone(result.fields[0].name)
        self.assertIsNone(result.fields[0].type)
        self.assertIsNone(result.fields[0].required)

    def test_request_form_does_not_fall_back_when_service_type_is_missing(self):
        connection = RecordingConnection([[]])

        result = get_request_form(connection, 999)

        self.assertIsNone(result.service_type)
        self.assertEqual(result.fields, [])
        self.assertEqual(len(connection.executions), 1)


if __name__ == "__main__":
    unittest.main()
