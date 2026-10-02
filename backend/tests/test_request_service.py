import os
import unittest
from datetime import date
from typing import Any



from app.database import QueryResult
from app.api.request.service import get_activities, get_board, get_my_requests, get_tracking


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
        self.parameters: list[dict[str, Any] | None] = []

    def insert_id(self, statement, parameters):
        return self.execute(statement, parameters).scalar_one()

    def execute(self, statement: str, parameters=None) -> QueryResult:
        self.statements.append(statement)
        self.parameters.append(parameters)
        return QueryResult(FakeCursor(next(self.result_sets)))


class RequestServiceTests(unittest.TestCase):
    def test_activity_lists_are_bound_and_split_at_oracle_limit(self):
        connection = RecordingConnection([[]])
        status = "Aberto' OR 1=1 --"
        get_activities(connection, date(2026, 9, 1), date(2026, 9, 30), [status], list(range(1001)))
        statement = connection.statements[0]
        parameters = connection.parameters[0]
        self.assertNotIn(status, statement)
        self.assertEqual(parameters["status_0"], status)
        self.assertEqual(statement.count("B.ID IN ("), 2)
        self.assertEqual(parameters["business_1000"], 1000)
        self.assertEqual(parameters["range_end"].date(), date(2026, 10, 1))

    def test_my_requests_requires_member_filter(self):
        connection = RecordingConnection([[]])

        result = get_my_requests(connection, 1)

        self.assertEqual(result, [])
        self.assertIn("WHERE R.ID_MEMBERSHIP_REQUESTER=:member", connection.statements[0])
        self.assertNotIn(":member IS NULL", connection.statements[0])
        self.assertEqual(connection.parameters[0], {"member": 1})

    def test_tracking_casts_optional_and_array_parameters(self):
        connection = RecordingConnection(
            [
                [
                    {
                        "total": 0,
                        "in_progress": 0,
                        "completed": 0, "open": 0, "canceled": 0,
                    }
                ],
                [],
                [],
                [],
                [],
                [],
                [{"handling_minutes": 0, "start_minutes": 0}], [],
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
        self.assertIn("CAST(:business AS INTEGER) IS NULL", executed_sql)
        self.assertIn("CAST(:category AS INTEGER) IS NULL", executed_sql)
        self.assertIn("NOT IN (:closed_0,:closed_1,:closed_2)", executed_sql)
        self.assertIn("TRUNC(R.CREATED_DATE,'MM')", executed_sql)
        self.assertIn("NLS_DATE_LANGUAGE=PORTUGUESE", executed_sql)
        self.assertNotIn("FILTER(", executed_sql)
        self.assertEqual([card["value"] for card in result["summaryCards"]], ["0"] * 5)
        self.assertEqual(result["averageHandlingMinutes"], 0)
        self.assertEqual(result["averageStartMinutes"], 0)

    def test_tracking_counts_and_event_date_clocks(self):
        connection = RecordingConnection([
            [{"total": 12, "completed": 5, "open": 3, "in_progress": 2, "canceled": 2}],
            [], [], [], [], [],
            [{"handling_minutes": 125, "start_minutes": 6001}], [],
        ])
        result = get_tracking(connection, date(2026, 9, 1), date(2026, 9, 30), 2, 3)
        self.assertEqual([card["value"] for card in result["summaryCards"]], ["12", "5", "3", "2", "2"])
        self.assertEqual(result["averageHandlingMinutes"], 125)
        self.assertEqual(result["averageStartMinutes"], 6001)
        clocks = connection.statements[-2]
        self.assertNotIn("R.CREATED_DATE>=", clocks)
        self.assertIn("R.FINISHED_DATE>R.STARTED_DATE", clocks)
        self.assertIn("R.STARTED_DATE>=R.CREATED_DATE", clocks)
        self.assertIn("RG.ID_BUSINESS=:business", clocks)
        self.assertIn("ST.ID_SERVICE_CATEGORY=:category", clocks)
        self.assertEqual(connection.parameters[-2]["business"], 2)
        self.assertEqual(connection.parameters[-2]["category"], 3)

    def test_tracking_returns_category_identity_without_presentation_colors(self):
        connection = RecordingConnection([
            [{"total": 5, "in_progress": 0, "completed": 0, "open": 0, "canceled": 0}],
            [
                {"category_id": 10, "label": "PMOC", "value": 3},
                {"category_id": 2, "label": "Refrigeração", "value": 2},
            ],
            [], [], [], [],
            [{"handling_minutes": 0, "start_minutes": 0}], [],
        ])

        result = get_tracking(connection, date(2026, 1, 1), date(2026, 9, 22), None, None)

        self.assertIn("SC.ID CATEGORY_ID", connection.statements[1])
        self.assertEqual(result["categoryData"], [
            {"categoryId": 10, "label": "PMOC", "value": 3},
            {"categoryId": 2, "label": "Refrigeração", "value": 2},
        ])

    def test_tracking_combines_multiple_categories_statuses_and_business_for_all_metrics(self):
        connection = RecordingConnection([
            [{"total": 0, "in_progress": 0, "completed": 0, "open": 0, "canceled": 0}],
            [], [], [], [], [], [{"handling_minutes": 0, "start_minutes": 0}],
            [{"id": 1, "name": "Em aberto"}, {"id": 2, "name": "Em andamento"}],
        ])
        result = get_tracking(connection, date(2026, 9, 1), date(2026, 9, 30), 7, None, [2, 10], [1, 2])
        for index in [0, 1, 2, 3, 6]:
            statement, params = connection.statements[index], connection.parameters[index]
            self.assertIn("ST.ID_SERVICE_CATEGORY IN (:category_id_0,:category_id_1)", statement)
            self.assertIn("R.ID_REQUEST_STATUS IN (:status_id_0,:status_id_1)", statement)
            self.assertEqual([params["category_id_0"], params["category_id_1"]], [2, 10])
            self.assertEqual([params["status_id_0"], params["status_id_1"]], [1, 2])
            self.assertEqual(params["business"], 7)
        self.assertEqual(len(result["filterOptions"]["statuses"]), 2)
        self.assertNotIn("category_id_0", connection.statements[5])
        self.assertNotIn("status_id_0", connection.statements[7])

    def test_board_combines_business_categories_search_and_dates(self):
        connection = RecordingConnection([[], []])
        get_board(connection, date(2026, 9, 1), date(2026, 9, 30), "bomba", 7, [2, 10])
        self.assertIn("RG.ID_BUSINESS=:business", connection.statements[1])
        self.assertIn("ST.ID_SERVICE_CATEGORY IN (:category_id_0,:category_id_1)", connection.statements[1])
        self.assertEqual(connection.parameters[1]["business"], 7)
        self.assertEqual(connection.parameters[1]["category_id_1"], 10)
        self.assertEqual(connection.parameters[1]["search_pattern"], "%bomba%")
        self.assertEqual(connection.parameters[1]["range_end"].date(), date(2026, 10, 1))

    def test_empty_category_selection_does_not_restrict_board(self):
        connection = RecordingConnection([[], []])
        get_board(connection, date(2026, 9, 1), date(2026, 9, 30), category_ids=[])
        self.assertNotIn("ST.ID_SERVICE_CATEGORY IN", connection.statements[1])

    def test_board_applies_search_to_request_fields(self):
        connection = RecordingConnection([[], []])

        result = get_board(
            connection,
            date(2026, 1, 1),
            date(2026, 9, 18),
            "  bomba  ",
        )

        self.assertEqual(result.model_dump(by_alias=True), {"statuses": [], "requests": []})
        self.assertIn("TO_CHAR(R.ID) LIKE :search_pattern", connection.statements[1])
        self.assertIn("UPPER(ST.NAME) LIKE UPPER(:search_pattern)", connection.statements[1])
        self.assertEqual(connection.parameters[1]["search"], "bomba")
        self.assertEqual(connection.parameters[1]["search_pattern"], "%bomba%")


if __name__ == "__main__":
    unittest.main()
