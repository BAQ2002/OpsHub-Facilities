import unittest
from datetime import date
from test_request_service import RecordingConnection
from app.api.request.service import get_board, get_board_column


class BoardPaginationTests(unittest.TestCase):
    def test_column_limits_in_sql_and_preserves_all_filters_and_order(self):
        cards = [{"id": i, "status_id": 4, "service_type_name": None,
                  "requester_name": None, "location_name": None} for i in range(100, 90, -1)]
        connection = RecordingConnection([[{"total": 200}], cards])
        result = get_board_column(connection, 4, date(2026, 1, 1), date(2026, 10, 8),
                                  " bomba ", 7, [2, 10], offset=15)
        self.assertEqual(result.offset, 15)
        self.assertEqual(result.total, 200)
        self.assertEqual(len(result.requests), 10)
        self.assertIn("R.CREATED_DATE DESC NULLS LAST, R.ID DESC", connection.statements[1])
        self.assertIn("OFFSET :page_offset ROWS FETCH NEXT :page_size ROWS ONLY", connection.statements[1])
        for params in connection.parameters:
            self.assertEqual(params["status_id"], 4)
            self.assertEqual(params["business"], 7)
            self.assertEqual(params["search_pattern"], "%bomba%")
            self.assertEqual(params["category_id_1"], 10)
        self.assertEqual(connection.parameters[1]["page_offset"], 15)
        self.assertEqual(connection.parameters[1]["page_size"], 10)

    def test_last_window_adjusts_after_records_are_removed(self):
        connection = RecordingConnection([[{"total": 23}], []])
        result = get_board_column(connection, 4, date(2026, 1, 1), date(2026, 10, 8), offset=100)
        self.assertEqual(result.offset, 13)
        self.assertEqual(connection.parameters[1]["page_offset"], 13)

    def test_empty_column_does_not_fetch_cards(self):
        connection = RecordingConnection([[{"total": 0}]])
        result = get_board_column(connection, 4, date(2026, 1, 1), date(2026, 10, 8), offset=30)
        self.assertEqual(result.offset, 0)
        self.assertEqual(result.requests, [])
        self.assertEqual(len(connection.statements), 1)

    def test_unregistered_order_cannot_reach_sql(self):
        for query in (get_board, get_board_column):
            connection = RecordingConnection([])
            with self.assertRaises(ValueError):
                if query is get_board:
                    query(connection, date(2026, 1, 1), date(2026, 10, 8), sort="ID; DROP TABLE OHFC_REQUEST")
                else:
                    query(connection, 4, date(2026, 1, 1), date(2026, 10, 8), sort="ID; DROP TABLE OHFC_REQUEST")
            self.assertEqual(connection.statements, [])
