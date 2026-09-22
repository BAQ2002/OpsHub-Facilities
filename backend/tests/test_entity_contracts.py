import copy
import json
import os
import unittest
from datetime import date
from decimal import Decimal
from pathlib import Path

os.environ.setdefault("DATABASE_URL", "postgresql://test:test@localhost/test")

from pydantic import ValidationError
from backend.app.api.entities import RequestContext, LocationEntity
from backend.app.api.request.service import get_activities, get_board, get_my_requests
from backend.app.api.service_catalog.service import get_catalog, get_request_form
from backend.app.api.organization.service import get_location_hierarchy
from backend.app.api.checklist.service import get_active_definitions
from backend.tests.test_request_service import RecordingConnection

FIXTURE = json.loads((Path(__file__).resolve().parents[2] / "tests/fixtures/entity-data.json").read_text(encoding="utf-8"))


class EntityContractTests(unittest.TestCase):
    def test_request_response_matches_frontend_contract_and_keeps_original_dates(self):
        connection = RecordingConnection([[FIXTURE["context"]]])
        result = get_my_requests(connection, 7)[0].model_dump(mode="json", by_alias=True)
        self.assertEqual(result, FIXTURE["context"])
        self.assertEqual(result["request"]["createdDate"], "2026-09-20T00:30:00")
        self.assertIn("WHERE R.ID_MEMBER_REQUESTER=%(member)s", connection.statements[0])

    def test_incomplete_records_are_rejected_instead_of_cast_as_entities(self):
        data = copy.deepcopy(FIXTURE["context"])
        del data["request"]["idServiceType"]
        with self.assertRaises(ValidationError):
            RequestContext.model_validate(data)

    def test_activity_filters_are_preserved_with_typed_empty_arrays(self):
        connection = RecordingConnection([[FIXTURE["context"]]])
        result = get_activities(connection, date(2026, 9, 1), date(2026, 9, 22), [], [])
        self.assertEqual(result[0].request.id, 42)
        self.assertIn("CAST(%(statuses)s AS TEXT[])", connection.statements[0])
        self.assertIn("CAST(%(businesses)s AS INTEGER[])", connection.statements[0])
        self.assertTrue(connection.parameters[0]["all_status"])
        self.assertTrue(connection.parameters[0]["all_business"])

    def test_board_serializes_entities_and_media_metadata_without_binary_content(self):
        board = FIXTURE["board"]
        row = board["requests"][0]
        visit = row["visits"][0]
        checklist = visit["checklists"][0]
        connection = RecordingConnection([
            board["statuses"], [FIXTURE["context"]], [visit["task"]], visit["executors"],
            visit["photos"], [{"checklist": checklist["checklist"], "definition": checklist["definition"]}],
            checklist["values"], row["values"], row["media"],
        ])
        result = get_board(connection, date(2026, 9, 1), date(2026, 9, 22))
        self.assertEqual(result.model_dump(mode="json", by_alias=True), board)
        self.assertNotIn("CONTENT", "\n".join(connection.statements))

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
