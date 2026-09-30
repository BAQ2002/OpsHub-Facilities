import copy
import hashlib
import json
import re
import tempfile
import unittest
from datetime import datetime
from pathlib import Path

from database.import_tickets.core import build_plan, digest, load_mapping
from database.import_tickets.export_sql import build_data, export_sql, literal, validate_data
from database.import_tickets.oracle import REQUEST_COLUMNS


def decode_string(expression):
    """Independent parser for the exported Oracle text expressions."""
    result, position = [], 0
    pattern = re.compile(r"\s*(?:TO_CLOB\(\s*)?('(?:''|[^'])*'|CHR\(\d+\))\s*\)?", re.S)
    while position < len(expression):
        match = pattern.match(expression, position)
        if not match:
            raise AssertionError(expression[position:position + 100])
        token = match[1]
        result.append(chr(int(token[4:-1])) if token.startswith("CHR(") else token[1:-1].replace("''", "'"))
        position = match.end()
        if expression[position:].lstrip().startswith("||"):
            position += len(expression[position:]) - len(expression[position:].lstrip()) + 2
        elif expression[position:].strip():
            raise AssertionError(expression[position:])
    return "".join(result)


class ExportSQLTests(unittest.TestCase):
    def setUp(self):
        config, self.catalog = load_mapping(Path(__file__).resolve().parents[1] / "mapping.json")
        config["request_numbers"] = {"665#1": 665, "665#2": 666}
        values = [("Número", 665), ("Categoria", "PMOC"), ("Chamado", "PMOC BIMESTRAL"),
                  ("SubCategoria", "Preventiva"), ("Tipo Chamado", "Administrativo"),
                  ("Status", "Fechado"), ("E-mail Solicitante", "pessoa@example.test"),
                  ("Nome Solicitante", "D'Ávila"), ("Local", "Mezanino"),
                  ("Data Abertura", "17/06/2026 11:33"), ("Descrição", "Linha 1\nLinha 2 & 'aspas'"),
                  ("Tag do equipamento", "AR-113")]
        raw = {"file": "test.xlsx", "sheet": "Sheet1", "row": 2, "locator": "test.xlsx::Sheet1::2",
               "cells": [{"header": h, "value": v, "column": str(i), "formula": False} for i, (h, v) in enumerate(values)]}
        self.plan = build_plan([raw], config, self.catalog)
        self.data = build_data(self.plan, self.catalog)

    def test_sql_strings_round_trip_quotes_controls_and_large_unicode(self):
        text = "D'Ávila & ç漢字\n\r\t" * 1800
        for clob in (False, True):
            sql = literal(text, clob)
            self.assertEqual(decode_string(sql), text)
            self.assertLess(max(len(line.encode("utf-8")) for line in sql.splitlines()), 2499)
            for token in re.findall(r"'(?:''|[^'])*'", sql):
                self.assertLess(len(token.encode("utf-8")), 4000)

    def test_dates_are_independent_of_nls(self):
        self.assertEqual(literal(datetime(2026, 6, 17, 11, 33)), "TO_DATE('2026-06-17 11:33:00', 'YYYY-MM-DD HH24:MI:SS')")
        self.assertEqual(literal(None), "NULL")

    def test_schema_validation_and_exact_request_number(self):
        validate_data(self.data)
        self.assertEqual(self.data["OHFC_REQUEST"][0]["ID"], 665)
        self.assertEqual(self.data["OHFC_IMPORT_TICKET"][0]["LEGACY_ID"], "665#1")
        self.assertEqual(self.data["OHFC_REGION"][0]["NAME"], "Prédio Administrativo")
        self.assertEqual(len(self.data["OHFC_SERVICE_CATEGORY"]), 9)
        categories = {r["NAME"]: r["ID"] for r in self.data["OHFC_SERVICE_CATEGORY"]}
        self.assertEqual(categories["PINTURA"], 9)
        self.assertEqual(categories["PMOC"], 10)
        self.assertNotIn("NOVOS PROJETOS", categories)

    def test_excluded_categories_do_not_generate_dependent_rows(self):
        config, catalog = load_mapping(Path(__file__).resolve().parents[1] / "mapping.json")
        raw = copy.deepcopy(self.plan["rows"][0]["raw"])
        for category in ("Dúvida Aplicativo", "NOVOS PROJETOS"):
            for cell in raw["cells"]:
                if cell["header"] == "Categoria":
                    cell["value"] = category
            plan = build_plan([raw], config, catalog)
            self.assertEqual(plan["summary"]["excluded"], 1)
            self.assertEqual(plan["summary"]["pending"], 0)
            self.assertEqual(plan["rows"], [])
            data = build_data(plan, catalog)
            for table in ("OHFC_REQUEST", "OHFC_SERVICE_TYPE", "OHFC_SERVICE_FIELD_TYPE",
                          "OHFC_SERVICE_FIELD_VALUE", "OHFC_MEMBERSHIP", "OHFC_IMPORT_TICKET", "OHFC_IMPORT_SNAPSHOT"):
                self.assertEqual(data[table], [], table)

    def test_json_fields_have_envelope_and_snapshot_preserves_raw(self):
        field = self.data["OHFC_SERVICE_FIELD_VALUE"][0]
        self.assertEqual(json.loads(field["VALUE"]), {"value": "AR-113"})
        snapshot = json.loads(self.data["OHFC_IMPORT_SNAPSHOT"][0]["PAYLOAD"])
        self.assertEqual(snapshot["row"], self.plan["rows"][0])

    def test_target_hash_matches_database_reader_contract(self):
        request = self.data["OHFC_REQUEST"][0]
        fields = self.data["OHFC_SERVICE_FIELD_VALUE"]
        state = {"request": {c.lower(): request[c] for c in REQUEST_COLUMNS},
                 "fields": [{"id_service_field_type": v["ID_SERVICE_FIELD_TYPE"], "value": v["VALUE"]} for v in fields]}
        self.assertEqual(self.data["OHFC_IMPORT_TICKET"][0]["TARGET_HASH"], digest(state))

    def test_invalid_fk_is_rejected_before_writing(self):
        self.data["OHFC_REQUEST"][0]["ID_LOCATION"] = 9999
        with self.assertRaisesRegex(ValueError, "FK inválida"):
            validate_data(self.data)

    def test_overlength_text_and_duplicate_keys_are_rejected(self):
        invalid = copy.deepcopy(self.data)
        invalid["OHFC_REQUEST"][0]["DESCRIPTION"] = "x" * 301
        with self.assertRaisesRegex(ValueError, "Texto excede"):
            validate_data(invalid)
        self.data["OHFC_REQUEST"].append(dict(self.data["OHFC_REQUEST"][0]))
        with self.assertRaisesRegex(ValueError, "Chave repetida"):
            validate_data(self.data)

    def test_pending_plan_cannot_be_exported(self):
        self.plan["summary"]["pending"] = 1
        with self.assertRaisesRegex(ValueError, "sem pendências"):
            build_data(self.plan, self.catalog)

    def test_media_catalog_without_historical_binaries(self):
        self.plan["rows"][0]["request"]["fields"].append({
            "name": "Foto", "value": ["https://example.test/expired.jpg?Expires=1"],
            "import_media_content": False,
            "definition": {"type": "MEDIA", "options": None, "required": 1,
                           "active": 1, "display_order": 2},
        })
        data = build_data(self.plan, self.catalog)
        validate_data(data)
        media_fields = [f for f in data["OHFC_SERVICE_FIELD_TYPE"] if f["TYPE"] == "MEDIA"]
        self.assertEqual(len(media_fields), 1)
        self.assertEqual(data["OHFC_SERVICE_FIELD_MEDIA"], [])
        self.assertFalse(any(v["ID_SERVICE_FIELD_TYPE"] == media_fields[0]["ID"]
                             for v in data["OHFC_SERVICE_FIELD_VALUE"]))
        self.assertIn("expired.jpg", data["OHFC_IMPORT_SNAPSHOT"][0]["PAYLOAD"])

    def test_output_tree_consolidation_and_manifest(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder)
            manifest = export_sql(self.plan, self.catalog, path)
            consolidated = (path / "INSERT_ALL_TABLES.sql").read_text(encoding="utf-8")
            self.assertIn((path / "RequestsTables/INSERT_REQUEST.sql").read_text(encoding="utf-8"), consolidated)
            self.assertIn("SET DEFINE OFF", consolidated)
            self.assertIn("WHENEVER SQLERROR EXIT SQL.SQLCODE ROLLBACK", consolidated)
            self.assertEqual(len(re.findall(r"^COMMIT;", consolidated, re.M)), 1)
            self.assertNotIn("CREATE TABLE", consolidated)
            self.assertNotIn("OHFC_IMPORT_", consolidated)
            runner = (path / "RUN_SQLPLUS.sql").read_text(encoding="utf-8")
            self.assertNotIn("ImportTables/", runner)
            audit = (path / "INSERT_IMPORT_TABLES.sql").read_text(encoding="utf-8")
            self.assertEqual(set(re.findall(r"INSERT INTO (\w+)", audit)),
                             {"OHFC_IMPORT_TICKET", "OHFC_IMPORT_SNAPSHOT"})
            self.assertNotIn("LOCK TABLE OHFC_REQUEST ", audit)
            self.assertEqual(len(re.findall(r"^COMMIT;", audit, re.M)), 1)
            for name in ("INSERT_IMPORT_TICKET.sql", "INSERT_IMPORT_SNAPSHOT.sql"):
                self.assertIn((path / "ImportTables" / name).read_text(encoding="utf-8"), audit)
            self.assertIn("Sem dados", (path / "ChecklistsTables/INSERT_CHECKLIST_FIELD_TYPE.sql").read_text(encoding="utf-8").replace("Não foram importados", "Sem dados"))
            for relative, expected in manifest["files"].items():
                self.assertEqual(hashlib.sha256((path / relative).read_bytes()).hexdigest(), expected)
            self.assertFalse(manifest["sql_executed_in_database"])


if __name__ == "__main__":
    unittest.main()
