import unittest
from datetime import datetime
from decimal import Decimal
from unittest.mock import MagicMock, patch
import oracledb
from pydantic import ValidationError
from backend.app import database
from backend.app.database import DatabaseConnection, QueryResult, Settings, decode_row, encode_json, sql


class DatabaseTests(unittest.TestCase):
    def test_settings_validate_member_and_pool(self):
        self.assertEqual(Settings(_env_file=None).current_member_id, 1)
        for options in ({"current_member_id": 0}, {"oracle_pool_min": 5, "oracle_pool_max": 1}):
            with self.assertRaises(ValidationError):
                Settings(_env_file=None, **options)

    def test_native_binds_are_unchanged(self):
        self.assertEqual(sql("SELECT :value FROM DUAL"), "SELECT :value FROM DUAL")

    def test_query_result_cardinality(self):
        self.assertEqual(QueryResult([{"id": 42}]).scalar_one(), 42)
        self.assertEqual(list(QueryResult([{"id": 1}, {"id": 2}]).scalars()), [1, 2])
        self.assertIsNone(QueryResult([]).one_or_none())
        for rows in ([], [{"id": 1}, {"id": 2}]):
            with self.assertRaises(LookupError):
                QueryResult(rows).one()

    def test_json_envelope_round_trip_and_nullable_join(self):
        for value in [None, False, 0, "", "ação", [1, False], {"value": 9}, {"id": None}]:
            row = decode_row(["field__id", "field__options", "member__id", "member__name"],
                             [1, encode_json(value), None, None])
            self.assertEqual(row, {"field": {"id": 1, "options": value}, "member": None})
        self.assertEqual(decode_row(["options"], [{"value": {"multiple": True}}]),
                         {"options": {"multiple": True}})
        with self.assertRaises(ValueError):
            decode_row(["options"], ['{"multiple": true}'])

    def test_cursor_closes_after_materializing_rows(self):
        raw = MagicMock()
        cursor = raw.cursor.return_value.__enter__.return_value
        cursor.bindnames.return_value = ["ID"]
        cursor.description = [("ID",), ("LOCATION_X",)]
        cursor.fetchall.return_value = [(42, Decimal("12.12345678"))]
        result = DatabaseConnection(raw).execute("SELECT ID, LOCATION_X FROM OHFC_LOCATION WHERE ID=:id", {"id": 42, "unused": 3})
        self.assertEqual(result.one(), {"id": 42, "location_x": Decimal("12.12345678")})
        cursor.execute.assert_called_once_with(None, {"id": 42})
        raw.cursor.return_value.__exit__.assert_called_once()

    def test_insert_output_binds_and_lob_input_types(self):
        raw = MagicMock()
        cursor = raw.cursor.return_value.__enter__.return_value
        cursor.bindnames.return_value = ["VALUE", "CONTENT", "NEW_ID", "RANGE_START", "RENTED"]
        cursor.var.return_value.getvalue.return_value = [42]
        result = DatabaseConnection(raw).insert_id("INSERT ... RETURNING ID INTO :new_id", {
            "value": encode_json(False), "content": b"photo", "range_start": datetime(2026, 9, 24), "rented": False,
        })
        self.assertEqual(result, 42)
        types = cursor.setinputsizes.call_args.kwargs
        self.assertEqual(types["value"], oracledb.DB_TYPE_CLOB)
        self.assertEqual(types["content"], oracledb.DB_TYPE_BLOB)
        self.assertEqual(types["range_start"], oracledb.DB_TYPE_TIMESTAMP)
        self.assertEqual(cursor.execute.call_args.args[1]["rented"], 0)

    def test_connection_rolls_back_on_request_failure_and_returns_to_pool(self):
        pool = MagicMock()
        raw = pool.acquire.return_value.__enter__.return_value
        with patch.object(database, "_pool", pool):
            dependency = database.get_connection()
            next(dependency)
            with self.assertRaisesRegex(RuntimeError, "failed"):
                dependency.throw(RuntimeError("failed"))
        raw.rollback.assert_called_once()
        pool.acquire.return_value.__exit__.assert_called_once()

    def test_pool_requires_explicit_credentials(self):
        with patch.object(database, "settings", Settings(_env_file=None, oracle_user="", oracle_dsn="", oracle_password="")):
            with self.assertRaisesRegex(ValueError, "ORACLE_USER"):
                database.open_pool()
