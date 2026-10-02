import unittest
from datetime import date

from app.api.request.service import get_activity_page, get_activity_map, get_activity_business_counts
from app.api.request.schemas import ActivityPage, ActivityMapRecord
from tests.test_request_service import RecordingConnection
from tests.test_entity_contracts import request_database_context


class ActivityPaginationTests(unittest.TestCase):
    def test_page_is_limited_in_database_and_preserves_filters(self):
        connection = RecordingConnection([[{"total": 58}], [request_database_context()]])
        result = get_activity_page(connection, date(2026, 9, 1), date(2026, 9, 30),
                                   ["Concluída"], "Unidade ' A", 2, 10)
        page = ActivityPage.model_validate(result)
        self.assertEqual((page.page, page.pageSize, page.total, len(page.items)), (2, 10, 58, 1))
        self.assertEqual(page.items[0].request.id, 42)
        self.assertIn("OFFSET :page_offset ROWS FETCH NEXT :page_size ROWS ONLY", connection.statements[1])
        self.assertIn("END),R.ID", connection.statements[1])
        self.assertEqual(connection.parameters[1]["page_offset"], 10)
        self.assertEqual(connection.parameters[1]["page_size"], 10)
        for statement, params in zip(connection.statements, connection.parameters):
            self.assertNotIn("Unidade ' A", statement)
            self.assertEqual(params["business_name"], "Unidade ' A")
            self.assertEqual(params["status_0"], "Concluída")
            self.assertEqual(params["range_end"].date(), date(2026, 10, 1))
        self.assertNotIn("OHFC_MEMBERSHIP", connection.statements[0])

    def test_saved_page_beyond_last_page_is_clamped(self):
        connection = RecordingConnection([[{"total": 21}], []])
        result = get_activity_page(connection, date(2026, 9, 1), date(2026, 9, 30), [], None, 99, 10)
        self.assertEqual(result["page"], 3)
        self.assertEqual(connection.parameters[1]["page_offset"], 20)

    def test_empty_result_skips_entity_query_and_returns_page_one(self):
        connection = RecordingConnection([[{"total": 0}]])
        result = get_activity_page(connection, date(2026, 9, 1), date(2026, 9, 30), [], None, 99, 25)
        self.assertEqual(result, {"items": [], "total": 0, "page": 1, "pageSize": 25})
        self.assertEqual(len(connection.statements), 1)

    def test_map_keeps_all_markers_with_only_map_fields(self):
        connection = RecordingConnection([[{"id": i, "category_id": None, "category": None,
                                            "location": None, "x": None, "y": 0.5} for i in range(60)]])
        result = get_activity_map(connection, date(2026, 9, 1), date(2026, 9, 30), ["Programada"])
        self.assertEqual(len(result), 60)
        marker = ActivityMapRecord.model_validate(result[0])
        self.assertEqual((marker.x, marker.y, marker.category), (0, 0.5, "Não informado"))
        self.assertEqual(set(result[0]), {"id", "categoryId", "category", "location", "x", "y"})
        self.assertNotIn("OFFSET", connection.statements[0])
        self.assertNotIn("OHFC_MEMBERSHIP", connection.statements[0])
        self.assertNotIn("OHFC_BUSINESS", connection.statements[0])
        self.assertEqual(connection.parameters[0]["status_0"], "Programada")

    def test_business_counts_are_aggregated_without_entity_projection(self):
        connection = RecordingConnection([[{"name": "Não informado", "total": 3}, {"name": "TECON", "total": 55}]])
        result = get_activity_business_counts(connection, date(2026, 9, 1), date(2026, 9, 30), [])
        self.assertEqual(result, [{"name": "Não informado", "count": 3}, {"name": "TECON", "count": 55}])
        self.assertIn("COUNT(*)", connection.statements[0])
        self.assertIn("GROUP BY", connection.statements[0])
        self.assertNotIn("request__", connection.statements[0])
