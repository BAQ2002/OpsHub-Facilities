"""Check the SQL source of truth and its consolidated installation script."""
import re
import unittest
from pathlib import Path
from backend.app.api.projections import COLUMNS


ROOT = Path(__file__).resolve().parents[2] / "database/SqlScripts/CreateTables"


def definitions(text):
    text = re.sub(r"--[^\n]*", "", text)
    return {
        name: re.sub(r"\s+", " ", body).strip()
        for name, body in re.findall(r"CREATE TABLE (\w+)\s*\((.*?)\);", text, re.S)
    }


class SchemaDefinitionTests(unittest.TestCase):
    def test_oracle_types_and_projection_columns_match_ddl(self):
        text = (ROOT / "CREATE_ALL_TABLES.sql").read_text(encoding="utf-8")
        self.assertNotRegex(text, r"\b(?:JSONB|BYTEA|BOOLEAN|VARCHAR)\b|ON UPDATE|ON DELETE RESTRICT")
        tables = definitions(text)
        for table, columns in COLUMNS.items():
            physical = re.findall(r"(?:^|, )([A-Z_]+) (?:NUMBER|VARCHAR2|TIMESTAMP|CLOB|BLOB|INTERVAL)\b", tables[table])
            self.assertEqual(columns, physical, table)
        self.assertEqual(text.count(" IS JSON)"), 4)

    def test_consolidated_matches_all_individual_definitions(self):
        individual = {}
        for path in ROOT.rglob("*.sql"):
            if path.name != "CREATE_ALL_TABLES.sql":
                tables = definitions(path.read_text(encoding="utf-8"))
                self.assertEqual(len(tables), 1, str(path))
                self.assertFalse(individual.keys() & tables.keys())
                individual.update(tables)
        self.assertEqual(len(individual), 23)
        consolidated = definitions((ROOT / "CREATE_ALL_TABLES.sql").read_text(encoding="utf-8"))
        self.assertEqual(consolidated, individual)
        created = set()
        for name, body in consolidated.items():
            self.assertTrue(name.startswith("OHFC_"))
            self.assertLessEqual(set(re.findall(r"REFERENCES (\w+)", body)), created)
            created.add(name)
        self.assertIn("ACCESS_LEVELS NUMBER(10) NOT NULL", consolidated["OHFC_SECTOR"])
        self.assertIn("FILE_SIZE NUMBER(10)", consolidated["OHFC_REQUEST_TASK_MEDIA"])

    def test_creation_and_references_do_not_specify_owner(self):
        for path in ROOT.rglob("*.sql"):
            self.assertNotRegex(path.read_text(encoding="utf-8"),
                                r"\b(?:CREATE TABLE|REFERENCES)\s+\w+\.")
