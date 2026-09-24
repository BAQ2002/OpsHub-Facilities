"""Opt-in reads against an existing Oracle 19c homologation schema; no DDL/DML."""
import os
import unittest
from datetime import date

import oracledb
from backend.app.database import DatabaseConnection, encode_json, _initialize_session
from backend.app.api.request.service import get_activities, get_board, get_home_metrics, get_my_requests, get_tracking
from backend.app.api.service_catalog.service import get_catalog, get_request_form, get_request_media
from backend.app.api.organization.service import get_location_hierarchy
from backend.app.api.checklist.service import get_active_definitions
from backend.app.api.membership.service import get_executor_options


@unittest.skipUnless(all(os.getenv(key) for key in (
    "ORACLE_TEST_USER", "ORACLE_TEST_PASSWORD", "ORACLE_TEST_DSN",
)), "Configure ORACLE_TEST_USER, ORACLE_TEST_PASSWORD e ORACLE_TEST_DSN para homologação.")
class OracleIntegrationTests(unittest.TestCase):
    def test_driver_and_read_flows(self):
        with oracledb.connect(user=os.environ["ORACLE_TEST_USER"],
                              password=os.environ["ORACLE_TEST_PASSWORD"],
                              dsn=os.environ["ORACLE_TEST_DSN"]) as raw:
            raw.call_timeout = 30000
            _initialize_session(raw, None)
            connection = DatabaseConnection(raw)
            for value in [None, False, 0, "", "ação", [1, 2], {"value": "nested"}]:
                actual = connection.execute("SELECT :value AS OPTIONS FROM DUAL", {"value": encode_json(value)}).one()
                self.assertEqual(actual["options"], value)
            self.assertEqual(connection.execute("SELECT :content AS CONTENT FROM DUAL", {"content": b"media"}).one()["content"], b"media")
            start = date.fromisoformat(os.getenv("ORACLE_TEST_START", date.today().isoformat()))
            end = date.fromisoformat(os.getenv("ORACLE_TEST_END", start.isoformat()))
            get_my_requests(connection, int(os.getenv("ORACLE_TEST_MEMBER_ID", "1")))
            get_activities(connection, start, end, [], [])
            get_activities(connection, start, end, ["Em andamento"], [1])
            get_board(connection, start, end, "bomba")
            get_home_metrics(connection, start, end)
            get_tracking(connection, start, end, None, None)
            get_tracking(connection, start, end, 1, 1)
            catalog = get_catalog(connection)
            for service in catalog.service_types[:1]:
                get_request_form(connection, service.id)
            get_request_form(connection, -1)
            get_location_hierarchy(connection)
            get_active_definitions(connection)
            get_executor_options(connection)
            get_request_media(connection, -1)
