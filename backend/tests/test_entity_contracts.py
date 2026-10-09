import copy
import json
import os
import re
import unittest
from datetime import date
from decimal import Decimal
from pathlib import Path



from pydantic import ValidationError
from app.api.entities import RequestContext, LocationEntity
from app.api.request.service import get_activities, get_board, get_my_requests, get_request_details
from app.api.service_catalog.service import get_catalog, get_request_form
from app.api.organization.service import get_location_hierarchy
from app.api.checklist.service import get_active_definitions
from tests.test_request_service import RecordingConnection

FIXTURE = json.loads((Path(__file__).resolve().parent / "fixtures/entity-data.json").read_text(encoding="utf-8"))


def database_record(record, renamed=None):
    """Simulate driver rows, using physical column names instead of API fixtures."""
    renamed = renamed or {}
    return {
        renamed.get(key, re.sub(r"(?<!^)(?=[A-Z])", "_", key).lower()): value
        for key, value in record.items()
    }


def request_database_context():
    context = copy.deepcopy(FIXTURE["context"])
    context["request"] = database_record(context["request"], {
        "idMemberRequester": "id_membership_requester",
        "idMemberResponder": "id_membership_responder",
    })
    return context


from app.api.request_task.service import get_visit_details


class EntityContractTests(unittest.TestCase):
    def test_request_response_matches_frontend_contract_and_keeps_original_dates(self):
        connection = RecordingConnection([[request_database_context()]])
        result = get_my_requests(connection, 7)[0].model_dump(mode="json", by_alias=True)
        self.assertEqual(result, FIXTURE["context"])
        self.assertEqual(result["request"]["createdDate"], "2026-09-20T00:30:00")
        self.assertIn("WHERE R.ID_MEMBERSHIP_REQUESTER=:member", connection.statements[0])

    def test_incomplete_records_are_rejected_instead_of_cast_as_entities(self):
        data = copy.deepcopy(FIXTURE["context"])
        del data["request"]["idServiceType"]
        with self.assertRaises(ValidationError):
            RequestContext.model_validate(data)

    def test_activity_filters_are_preserved_with_typed_empty_arrays(self):
        connection = RecordingConnection([[request_database_context()]])
        result = get_activities(connection, date(2026, 9, 1), date(2026, 9, 22), [], [])
        self.assertEqual(result[0].request.id, 42)
        self.assertNotIn(":status_", connection.statements[0])
        self.assertNotIn(":business_", connection.statements[0])
        self.assertEqual(set(connection.parameters[0]), {"range_start", "range_end"})
        self.assertEqual(connection.parameters[0]["range_end"].date(), date(2026, 9, 23))


    def test_board_uses_three_queries_and_limits_cards_per_status(self):
        rows = [{"id": 42 + i, "status_id": 4, "service_type_name": "Serviço",
                 "requester_name": None, "location_name": None} for i in range(10)]
        connection = RecordingConnection([FIXTURE["board"]["statuses"], [{"status_id": 4, "total": 2000}], rows])
        result = get_board(connection, date(2026, 9, 1), date(2026, 9, 22))
        data = result.model_dump(mode="json", by_alias=True)
        self.assertEqual(len(data["requests"]), 10)
        self.assertEqual(data["counts"], {"4": 2000})
        self.assertEqual(set(data["requests"][0]), {"id", "statusId", "serviceTypeName", "requesterName", "locationName"})
        self.assertEqual(len(connection.statements), 3)
        self.assertNotIn("OHFC_REQUEST_TASK", "\n".join(connection.statements))
        self.assertIn("PARTITION BY R.ID_REQUEST_STATUS", connection.statements[2])
        self.assertIn("WHERE BOARD_POSITION<=:page_size", connection.statements[2])
        self.assertEqual(connection.parameters[2]["page_size"], 10)

    def test_request_details_include_visit_summaries_without_visit_queries(self):
        request = FIXTURE["board"]["requests"][0]
        task = database_record(request["visits"][0]["task"], {
            "startDatetime": "started_date", "stopDatetime": "finished_date",
        })
        connection = RecordingConnection([[request_database_context()], request["values"], request["media"], [task]])
        result = get_request_details(connection, 42).model_dump(mode="json", by_alias=True)
        self.assertEqual(result["visits"], [request["visits"][0]["task"]])
        self.assertEqual(result["values"], request["values"])
        self.assertEqual(result["media"], request["media"])
        self.assertEqual(len(connection.statements), 4)
        self.assertNotIn("OHFC_REQUEST_TASK_CHECKLIST", "\n".join(connection.statements))
        self.assertTrue(all(params["id"] == 42 for params in connection.parameters))

    def test_visit_details_keep_executors_checklists_and_media_metadata(self):
        visit = FIXTURE["board"]["requests"][0]["visits"][0]
        checklist = visit["checklists"][0]
        task = database_record(visit["task"], {
            "startDatetime": "started_date", "stopDatetime": "finished_date",
        })
        executors = [dict(item, occurrence=database_record(item["occurrence"], {
            "idTask": "id_request_task",
        })) for item in visit["executors"]]
        connection = RecordingConnection([[task], executors, visit["photos"],
            [{"checklist": checklist["checklist"], "definition": checklist["definition"]}], checklist["values"]])
        result = get_visit_details(connection, task["id"]).model_dump(mode="json", by_alias=True)
        self.assertEqual(result, visit)
        self.assertNotIn("CONTENT", "\n".join(connection.statements))

    def test_missing_details_do_not_query_related_records(self):
        for lookup in (get_request_details, get_visit_details):
            connection = RecordingConnection([[]])
            self.assertIsNone(lookup(connection, 999))
            self.assertEqual(len(connection.statements), 1)

    def test_organization_preserves_nullable_relationships_and_decimal_precision(self):
        data = FIXTURE["organization"]
        connection = RecordingConnection([data["businesses"], data["regions"], data["locations"]])
        result = get_location_hierarchy(connection).model_dump(mode="json", by_alias=True)
        self.assertEqual(result, data)
        location = LocationEntity(id=1, id_region=None, name=None,
                                  location_x=Decimal("12.12345678"), location_y=Decimal("123.12345678"))
        self.assertEqual(location.model_dump(mode="json", by_alias=True)["locationY"], "123.12345678")

    def test_catalog_and_form_keep_foreign_keys_and_raw_field_configuration(self):
        catalog = FIXTURE["catalog"]
        result = get_catalog(RecordingConnection([catalog["categories"], catalog["serviceTypes"]]))
        self.assertEqual(result.model_dump(mode="json", by_alias=True), catalog)
        form = FIXTURE["form"]
        result = get_request_form(RecordingConnection([
            [{"service_type": form["serviceType"], "category": form["category"]}], form["fields"],
        ]), 2)
        self.assertEqual(result.model_dump(mode="json", by_alias=True), form)
        self.assertIn("custom_key", result.fields[0].options)

    def test_checklists_keep_persisted_fields_and_allow_empty_definitions(self):
        data = FIXTURE["checklists"][0]
        empty = {**data["checklist"], "id": 9}
        result = get_active_definitions(RecordingConnection([[
            {"checklist": data["checklist"], "field": data["fields"][0]},
            {"checklist": empty, "field": None},
        ]]))
        self.assertEqual(result[0].model_dump(mode="json", by_alias=True), data)
        self.assertEqual(result[1].fields, [])


if __name__ == "__main__":
    unittest.main()
