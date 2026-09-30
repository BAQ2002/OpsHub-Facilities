import unittest
from pathlib import Path

from database.import_tickets.core import load_mapping
from database.import_tickets.field_catalog import prepare_fields


class FieldCatalogTests(unittest.TestCase):
    def setUp(self):
        self.config, _ = load_mapping(Path(__file__).resolve().parents[1] / "mapping.json")

    def prepare(self, category, service, name, value):
        fields, warnings = [{"name": name, "value": value}], []
        prepare_fields(fields, category, service, self.config, warnings)
        return fields[0], warnings

    def test_catalog_preserves_selection_configuration(self):
        self.assertEqual(len(self.config["field_catalog"]), 181)
        field, warnings = self.prepare("ARTÍFICE", "Regulagem de porta", "Tipo da porta", "Madeira")
        self.assertEqual(field["definition"], {"type": "SINGLE_SELECT", "options": ["Madeira", "Corta-fogo", "Vidro", "Metálica"], "required": 1, "active": 1, "display_order": 3})
        self.assertEqual(warnings, [])

    def test_multiselect_keeps_unknown_historical_choices(self):
        field, warnings = self.prepare("ARTÍFICE", "Regulagem de porta", "Problema identificado", "Desalinhada,Mola solta")
        self.assertEqual(field["value"], ["Desalinhada", "Mola solta"])
        self.assertEqual(field["definition"]["type"], "MULTI_SELECT")
        self.assertEqual(len(warnings), 1)

    def test_bool_date_and_number_are_typed(self):
        definition = next(d for d in self.config["field_catalog"] if d["name"] == "Possui pt vinculada")
        field, _ = self.prepare(definition["category"], definition["service"], definition["name"], "Não")
        self.assertIs(field["value"], False)
        definition = next(d for d in self.config["field_catalog"] if d["type"] == "DATE")
        field, _ = self.prepare(definition["category"], definition["service"], definition["name"], "13/01/2026")
        self.assertEqual(field["value"], "2026-01-13T00:00:00")
        definition = next(d for d in self.config["field_catalog"] if d["type"] == "NUMBER")
        field, _ = self.prepare(definition["category"], definition["service"], definition["name"], "2,5")
        self.assertEqual(field["value"], 2.5)
        with self.assertRaises(ValueError):
            self.prepare(definition["category"], definition["service"], definition["name"], "inválido")

    def test_service_scope_prevents_metadata_leaking(self):
        field, _ = self.prepare("Outro", "Outro", "Tipo da porta", "Madeira")
        self.assertEqual(field["definition"], {"type": "TEXT", "options": None, "required": 0, "active": 1, "display_order": 1})
