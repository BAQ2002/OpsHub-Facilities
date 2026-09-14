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


class RecordingConnection:
    def __init__(self, result_sets: list[list[dict[str, Any]]]) -> None:
        self.result_sets = iter(result_sets)

    def execute(self, statement: str, parameters=None) -> QueryResult:
        return QueryResult(FakeCursor(next(self.result_sets)))


class ServiceCatalogServiceTests(unittest.TestCase):
    def test_request_form_maps_media_configuration(self):
        connection = RecordingConnection(
            [
                [{"id": 2, "name": "Outros", "category": "ARTÍFICE"}],
                [
                    {
                        "id": 2,
                        "name": "Foto da necessidade",
                        "type": "MEDIA",
                        "options": {"multiple": True, "accept": ["image/*", "video/*"]},
                        "required": True,
                    }
                ],
            ]
        )

        result = get_request_form(connection, "ARTÍFICE", "Outros", 2)

        self.assertEqual(result.serviceTypeId, 2)
        self.assertEqual(result.fields[0].type, "file")
        self.assertEqual(
            result.fields[0].mediaOptions,
            {"multiple": True, "accept": ["image/*", "video/*"]},
        )
        self.assertIsNone(result.fields[0].options)

    def test_request_form_tolerates_nullable_legacy_metadata(self):
        connection = RecordingConnection(
            [
                [{"id": 2, "name": "Outros", "category": "ARTÍFICE"}],
                [
                    {
                        "id": 2,
                        "name": None,
                        "type": None,
                        "options": None,
                        "required": None,
                    }
                ],
            ]
        )

        result = get_request_form(connection, "ARTÍFICE", "Outros", 2)

        self.assertEqual(result.fields[0].label, "Campo adicional")
        self.assertEqual(result.fields[0].type, "text")
        self.assertFalse(result.fields[0].required)


if __name__ == "__main__":
    unittest.main()
