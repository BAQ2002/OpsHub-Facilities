import copy
import json
import tempfile
import unittest
from pathlib import Path

from database.import_tickets.core import (
    build_plan, classify, load_mapping, map_row, norm, read_workbooks, resolve_location,
    digest, reserve_numbers, location_signature,
)
from database.import_tickets.oracle import ImportConflict, OracleStore, apply_plan, convert_field


ROOT = Path(__file__).resolve().parents[1]


def raw_row(number=1, *extra, locator="file.xlsx::Sheet1::2"):
    values = [("Número", number), ("Categoria", "ARTÍFICE"), ("Chamado", "Outros"),
              ("SubCategoria", "Corretiva"), ("Tipo Chamado", "Administrativo"),
              ("Status", "Aberto"), ("E-mail Solicitante", " Pessoa@empresa.com "),
              ("Nome Solicitante", "Pessoa"), ("Local", "Mezanino"), *extra]
    return {"file": "file.xlsx", "sheet": "Sheet1", "row": 2, "locator": locator,
            "cells": [{"column": str(i), "header": h, "value": v, "formula": False}
                      for i, (h, v) in enumerate(values, 1)]}


class MappingTests(unittest.TestCase):
    def setUp(self):
        self.config, self.catalog = load_mapping(ROOT / "mapping.json")
        for key in ("request_numbers", "duplicate_occurrences", "description_summaries", "location_resolutions"):
            self.config.pop(key, None)

    def test_multiple_description_columns_keep_distinct_content(self):
        raw = raw_row(1, ("Descrição", None), ("Descrição ", "Vazamento"),
                      ("Descrição da solicitação:", "Trocar mangueira"),
                      ("Observações adicionais", "Vazamento"))
        row = map_row(raw, self.config, self.catalog)
        self.assertEqual(row["request"]["description"], "Vazamento\nTrocar mangueira")
        self.assertEqual(row["errors"], [])
        self.assertEqual(row["request"]["requester"]["email"], "pessoa@empresa.com")

    def test_headers_are_semantic_without_overmatching_equipment(self):
        for header in ("Local:", "LOCAL DO VAZAMENTO", "Localização da caixa"):
            self.assertEqual(classify(header, self.config), "location")
        self.assertEqual(classify("Unidade de negócio", self.config), "business")
        self.assertEqual(classify("Remanejamento de unidade evaporadora", self.config), "extra")
        self.assertEqual(classify("Anexo descritivo da operação", self.config), "extra")

    def test_service_specific_header_override(self):
        rule = {"header_overrides": {"Referência": "description"}}
        self.assertEqual(classify("referencia:", self.config, rule), "description")
        self.assertEqual(classify("referencia:", self.config), "extra")

    def resolve(self, *pairs):
        cells = [{"header": h, "value": v, "role": classify(h, self.config)} for h, v in pairs]
        return resolve_location(cells, self.config, self.catalog)

    def test_business_region_and_generic_location_are_resolved_together(self):
        location, errors = self.resolve(("Unidade", "CLS"), ("Prédio", "Prédio ADM"))
        self.assertFalse(errors)
        self.assertEqual(location["business"], "Centro Logístico Salvador")
        self.assertEqual(location["location"], "Local exato não especificado")

    def test_building_without_business_is_ambiguous(self):
        location, errors = self.resolve(("Local", "Prédio ADM"))
        self.assertIsNone(location)
        self.assertIn("Localização ambígua", errors)

    def test_building_and_floor_use_generic_floor_not_specific_room(self):
        location, errors = self.resolve(("Unidade", "TECON"), ("Prédio", "Prédio ADM"), ("Andar", "2º"))
        self.assertFalse(errors)
        self.assertEqual(location["location"], "Prédio ADM 2º andar")

    def test_multiple_locations_conflict_instead_of_first_wins(self):
        location, errors = self.resolve(("Local", "Mezanino"), ("Local da porta", "Scanner"))
        self.assertIsNone(location)
        self.assertTrue(errors)

    def test_unknown_detail_is_not_discarded(self):
        location, errors = self.resolve(("Local", "Mezanino"), ("Ambiente", "Sala inexistente"))
        self.assertIsNone(location)
        self.assertTrue(any("conflitante" in e for e in errors))

    def test_absence_only_uses_region_one(self):
        location, errors = self.resolve(("Local", "-"), ("Prédio", ""), ("Unidade", None))
        self.assertFalse(errors)
        self.assertEqual(location, {"business": "TECON Salvador", "region": "Prédio Administrativo",
                                   "region_id": 1, "location": "Local exato não especificado"})

    def test_missing_location_does_not_suppress_other_row_errors(self):
        raw = raw_row(1, ("Descrição", "x" * 301))
        raw["cells"] = [c for c in raw["cells"] if c["header"] != "Local"]
        row = map_row(raw, self.config, self.catalog)
        self.assertEqual(row["request"]["location"]["region_id"], 1)
        self.assertTrue(any("limite 300" in error for error in row["errors"]))

    def test_unknown_location_under_explicit_region_is_created(self):
        location, errors = self.resolve(("Unidade", "CLS"), ("Prédio", "Prédio ADM"), ("Local", "Sala nova"))
        self.assertFalse(errors)
        self.assertEqual(location, {"business": "Centro Logístico Salvador", "region": "Prédio Administrativo", "location": "Sala nova"})

    def test_unknown_detail_mentions_region_and_keeps_original_name(self):
        location, errors = self.resolve(("Local", "Almoxarifado Estoque 04"))
        self.assertFalse(errors)
        self.assertEqual(location["region"], "Almoxarifado")
        self.assertEqual(location["location"], "Almoxarifado Estoque 04")

    def test_unmapped_location_with_ambiguous_parent_is_not_absence(self):
        location, errors = self.resolve(("Local", "Prédio ADM térreo"))
        self.assertIsNone(location)
        self.assertTrue(any("não determinada" in error for error in errors))

    def test_known_location_conflict_never_uses_absence_default(self):
        location, errors = self.resolve(("Unidade", "CLS"), ("Local", "Mezanino"))
        self.assertIsNone(location)
        self.assertTrue(errors)

    def test_new_location_conflicting_parent_never_uses_absence_default(self):
        location, errors = self.resolve(("Unidade", "CLS"), ("Local", "Almoxarifado Estoque 04"))
        self.assertIsNone(location)
        self.assertTrue(any("conflitante" in error for error in errors))

    def test_new_location_plan_deduplicates_names_by_parent(self):
        first = raw_row(1)
        second = raw_row(2)
        for raw in (first, second):
            raw["cells"][-1]["value"] = "Almoxarifado estoque 04"
        plan = build_plan([first, second], self.config, self.catalog)
        self.assertEqual(len(plan["new_locations"]), 1)
        self.assertEqual(plan["summary"]["ready"], 2)

    def test_new_location_cannot_exceed_database_limit(self):
        location, errors = self.resolve(("Prédio", "Almoxarifado"), ("Local", "x" * 101))
        self.assertIsNone(location)
        self.assertTrue(any("100 caracteres" in error for error in errors))

    def test_creation_can_be_disabled(self):
        self.config["create_unmapped_locations"] = False
        location, errors = self.resolve(("Local", "Almoxarifado Estoque 04"))
        self.assertIsNone(location)
        self.assertTrue(any("Local não mapeado" in error for error in errors))

    def test_description_overflow_is_not_truncated(self):
        row = map_row(raw_row(1, ("Descrição do problema", "x" * 301)), self.config, self.catalog)
        self.assertEqual(len(row["request"]["description"]), 301)
        self.assertTrue(any("limite 300" in e for e in row["errors"]))

    def test_duplicates_with_different_service_block_both(self):
        first = raw_row()
        second = raw_row(1, locator="file.xlsx::Sheet1::3")
        second["cells"][2]["value"] = "Reparos em móveis"
        plan = build_plan([first, second], self.config, self.catalog)
        self.assertEqual(plan["summary"]["ready"], 0)
        self.assertEqual(plan["summary"]["pending"], 2)

    def test_identical_duplicate_is_only_imported_once(self):
        plan = build_plan([raw_row(), raw_row(1, locator="other.xlsx::Sheet1::50")], self.config, self.catalog)
        self.assertEqual(plan["summary"]["ready"], 1)
        self.assertEqual(plan["summary"]["identical_duplicates"], 1)

    def test_explicit_row_resolution_keeps_original_data(self):
        raw = raw_row(1, ("Descrição", "x" * 301))
        self.config["row_overrides"][raw["locator"]] = {"description": "Resumo revisado"}
        row = map_row(raw, self.config, self.catalog)
        self.assertEqual(row["request"]["description"], "Resumo revisado")
        self.assertEqual(row["raw"]["cells"][-1]["value"], "x" * 301)
        self.assertFalse(row["errors"])

    def test_history_explicit_dates_and_creator_are_not_confused(self):
        row = map_row(raw_row(1, ("Histórico", "Data abertura: 02/01/2026 12:00\nData andamento: 03/01/2026 14:20"),
                                  ("E-mail Criador", "outra@empresa.com")), self.config, self.catalog)
        self.assertEqual(row["request"]["created_date"], "2026-01-02T12:00:00")
        self.assertEqual(row["request"]["started_date"], "2026-01-03T14:20:00")
        self.assertEqual(row["request"]["requester"]["email"], "pessoa@empresa.com")

    def test_urls_are_preserved_but_never_downloaded_or_saved_as_blob(self):
        row = map_row(raw_row(1, ("Foto", "https://example.test/photo.jpg")), self.config, self.catalog)
        self.assertEqual(row["request"]["fields"], [])
        self.assertTrue(any("sem download" in w for w in row["warnings"]))
        self.assertEqual(row["raw"]["cells"][-1]["value"], "https://example.test/photo.jpg")

    def test_bool_zero_and_false_are_not_missing(self):
        self.assertEqual(norm(0), "0")
        self.assertIs(convert_field(False, "BOOL"), False)
        self.assertIs(convert_field(0, "BOOL"), False)
        self.assertEqual(convert_field("2,5", "NUMBER"), 2.5)
        with self.assertRaises(ImportConflict):
            convert_field("talvez", "BOOL")
        with self.assertRaises(ImportConflict):
            convert_field("https://example.test", "MEDIA")

    def test_invalid_date_field_cannot_enter_a_typed_field(self):
        self.assertEqual(convert_field("30/09/2026", "DATE"), "2026-09-30T00:00:00")
        with self.assertRaises(ImportConflict):
            convert_field("31/09/2026", "DATE")

    def test_workbook_reader_preserves_duplicate_headers_and_formulas(self):
        import openpyxl
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "source.xlsx"
            book = openpyxl.Workbook()
            book.active.append(["Número", "Descrição", "Descrição ", "Data"])
            book.active.append([1, "Primeira", "Segunda", "=1+1"])
            book.save(path)
            book.close()
            raw = list(read_workbooks([path]))[0]
            self.assertEqual([c["value"] for c in raw["cells"]][1:3], ["Primeira", "Segunda"])
            self.assertTrue(raw["cells"][3]["formula"])
            self.assertTrue(any("fórmula" in e for e in map_row(raw, self.config, self.catalog)["errors"]))


class FakeStore:
    """A transaction boundary spy: verify safety without connecting to Oracle."""
    def __init__(self, previous=None, changed=False, fail_fields=False, unmanaged=False):
        self.connection = self
        self.previous = previous
        self.changed = changed
        self.fail_fields = fail_fields
        self.unmanaged = unmanaged
        self.committed = False
        self.rolled_back = False
        self.writes = []

    def commit(self):
        self.committed = True

    def advance_request_identity(self):
        self.identity_advanced = True

    def rollback(self):
        self.rolled_back = True

    def lock(self):
        pass

    def check_catalog_ids(self):
        pass

    def has_unmanaged_requests(self):
        return self.unmanaged

    def rows(self, sql, **params):
        return [self.previous] if self.previous else []

    def state_hash(self, request_id):
        return "changed" if self.changed else "unchanged"

    def request_values(self, request):
        return {"ID_SERVICE_TYPE": 5}

    def insert(self, table, values):
        self.writes.append((table, values))
        return values.get("ID", 10)

    def execute(self, sql, **params):
        self.writes.append((sql, params))

    def save_fields(self, request_id, service_id, fields):
        if self.fail_fields:
            raise ImportConflict("Falha na resposta")


class PersistenceTests(unittest.TestCase):
    def setUp(self):
        config, catalog = load_mapping(ROOT / "mapping.json")
        for key in ("request_numbers", "duplicate_occurrences", "description_summaries", "location_resolutions"):
            config.pop(key, None)
        self.plan = build_plan([raw_row()], config, catalog)

    def test_repeated_import_does_not_write(self):
        store = FakeStore(previous={"id_request": 10, "content_hash": self.plan["rows"][0]["content_hash"], "target_hash": "unchanged"})
        result = apply_plan(store, self.plan)
        self.assertEqual(result["unchanged"], 1)
        self.assertEqual(store.writes, [])

    def test_changed_source_requires_explicit_update(self):
        store = FakeStore(previous={"id_request": 10, "content_hash": "old", "target_hash": "unchanged"})
        with self.assertRaisesRegex(ImportConflict, "update-existing"):
            apply_plan(store, self.plan)
        self.assertTrue(store.rolled_back)
        self.assertFalse(store.writes)

    def test_manual_changes_are_never_overwritten(self):
        store = FakeStore(previous={"id_request": 10, "content_hash": "old", "target_hash": "unchanged"}, changed=True)
        with self.assertRaisesRegex(ImportConflict, "editado no destino"):
            apply_plan(store, self.plan, update_existing=True)
        self.assertTrue(store.rolled_back)
        self.assertFalse(store.writes)

    def test_failure_after_request_insert_rolls_back_batch(self):
        store = FakeStore(fail_fields=True)
        with self.assertRaises(ImportConflict):
            apply_plan(store, self.plan)
        self.assertTrue(store.rolled_back)
        self.assertFalse(store.committed)

    def test_new_request_records_full_snapshot(self):
        store = FakeStore()
        result = apply_plan(store, self.plan)
        self.assertEqual(result["inserted"], 1)
        self.assertTrue(store.committed)
        snapshot = next(v for t, v in store.writes if t == "OHFC_IMPORT_SNAPSHOT")
        self.assertEqual(json.loads(snapshot["PAYLOAD"])["row"]["raw"], self.plan["rows"][0]["raw"])

    def test_unreconciled_seed_database_is_blocked(self):
        store = FakeStore(unmanaged=True)
        with self.assertRaisesRegex(ImportConflict, "correspondência"):
            apply_plan(store, self.plan)
        self.assertFalse(store.writes)

    def test_pending_row_is_never_applied(self):
        plan = copy.deepcopy(self.plan)
        plan["rows"][0]["errors"] = ["Local ambíguo"]
        plan["summary"]["pending"] = 1
        store = FakeStore()
        result = apply_plan(store, plan)
        self.assertEqual(result["inserted"], 0)
        self.assertFalse(store.writes)

    def test_fixed_region_checks_actual_id_before_creating_location(self):
        from unittest.mock import Mock
        store = OracleStore(None)
        store.rows = Mock(return_value=[{"region_name": "Outro prédio", "business_name": "TECON Salvador"}])
        store.named_id = Mock()
        request = copy.deepcopy(self.plan["rows"][0]["request"])
        request["location"] = {"business": "TECON Salvador", "region": "Prédio Administrativo",
                               "region_id": 1, "location": "Local exato não especificado"}
        with self.assertRaisesRegex(ImportConflict, "Região 1"):
            store.request_values(request)
        store.named_id.assert_not_called()
        self.assertEqual(store.rows.call_args.kwargs, {"id": 1})

    def test_location_upsert_reuses_name_only_under_same_region(self):
        from unittest.mock import Mock
        store = OracleStore(None)
        store.rows = Mock(return_value=[{"id": 52, "name": "Almoxarifado Estoque 04"}])
        store.insert = Mock()
        self.assertEqual(store.named_id("OHFC_LOCATION", "almoxarifado estoque 04", {"ID_REGION": 2}), 52)
        store.insert.assert_not_called()
        self.assertEqual(store.rows.call_args.kwargs, {"ID_REGION": 2})
        store.rows.return_value = []
        store.insert.return_value = 53
        self.assertEqual(store.named_id("OHFC_LOCATION", "Sala nova", {"ID_REGION": 6}), 53)
        store.insert.assert_called_once_with("OHFC_LOCATION", {"ID_REGION": 6, "NAME": "Sala nova"})

    def test_explicit_import_id_is_written_and_identity_advanced(self):
        self.plan["rows"][0]["request"]["import_id"] = 665
        store = FakeStore()
        apply_plan(store, self.plan)
        request = next(v for t, v in store.writes if t == "OHFC_REQUEST")
        self.assertEqual(request["ID"], 665)
        self.assertTrue(store.identity_advanced)
        self.assertTrue(store.committed)

    def test_reserved_id_collision_rolls_back_without_overwrite(self):
        from unittest.mock import Mock
        self.plan["rows"][0]["request"]["import_id"] = 665
        store = FakeStore()
        store.rows = Mock(side_effect=[[], [{"id": 665}]])
        with self.assertRaisesRegex(ImportConflict, "ocupado"):
            apply_plan(store, self.plan)
        self.assertTrue(store.rolled_back)
        self.assertFalse(store.writes)

    def test_identity_advancement_does_not_issue_ddl_or_commit(self):
        from unittest.mock import Mock
        store = OracleStore(None)
        store.rows = Mock(return_value=[{"sequence_name": "ISEQ$$_123", "increment_by": 1}])
        store.execute = Mock()
        store.advance_request_identity()
        statement = store.execute.call_args.args[0]
        self.assertIn('"ISEQ$$_123".NEXTVAL', statement)
        self.assertIn("MAX(ID)", statement)
        self.assertNotIn("ALTER", statement)
        self.assertNotIn("COMMIT", statement)


class ReviewedRulesTests(unittest.TestCase):
    def setUp(self):
        self.config, self.catalog = load_mapping(ROOT / "mapping.json")

    def test_approved_adm_and_partial_tecon_go_to_region_one(self):
        for pairs in (("Local", "Prédio ADM"), ("Centro logístico", "TECON")):
            raw = raw_row(11)
            raw["cells"][-1].update(header=pairs[0], value=pairs[1])
            row = map_row(raw, self.config, self.catalog)
            self.assertFalse(row["errors"])
            self.assertEqual(row["request"]["location"]["region_id"], 1)

    def test_approved_unknown_parent_uses_tecon_default(self):
        raw = raw_row(609)
        raw["cells"][-1].update(header="Local da tomada", value="2° prédio ADM")
        row = map_row(raw, self.config, self.catalog)
        self.assertFalse(row["errors"])
        self.assertEqual(row["request"]["location"]["business"], "TECON Salvador")
        self.assertEqual(row["request"]["location"]["location"], "Local exato não especificado")

    def test_cls_resolution_preserves_region_instead_of_tecon(self):
        raw = raw_row(1033, ("Unidade de negócio", "Centro Logístico"))
        raw["cells"][-2]["value"] = "Pátio Operacional"
        row = map_row(raw, self.config, self.catalog)
        self.assertFalse(row["errors"])
        self.assertEqual(row["request"]["location"], {"business": "Centro Logístico Salvador",
                          "region": "Pàtio Operacional", "location": "Local exato não especificado"})

    def test_reviewed_summary_requires_exact_original_content(self):
        original = "Detalhes relevantes da atividade. " * 12
        self.config["description_summaries"]["74"] = {"source_hash": digest(original), "text": "Resumo revisado."}
        # Description normalization strips outer whitespace before hashing.
        self.config["description_summaries"]["74"]["source_hash"] = digest(original.strip())
        row = map_row(raw_row(74, ("Descrição", original)), self.config, self.catalog)
        self.assertFalse(row["errors"])
        self.assertEqual(row["request"]["description"], "Resumo revisado.")
        self.assertEqual(row["full_description"], original.strip())
        changed = map_row(raw_row(74, ("Descrição", original + "Nova informação.")), self.config, self.catalog)
        self.assertTrue(any("limite 300" in e for e in changed["errors"]))

    def test_duplicate_identity_survives_reordering_and_partial_exports(self):
        first = raw_row(665, ("Data Abertura", "17/06/2026 11:33"))
        second = copy.deepcopy(first)
        for c in first["cells"]:
            if c["header"] == "Categoria": c["value"] = "PMOC"
            if c["header"] == "Chamado": c["value"] = "PMOC BIMESTRAL"
        for c in second["cells"]:
            if c["header"] == "Categoria": c["value"] = "INSTALAÇÕES HIDRÁULICAS"
        plan = build_plan([second, first], self.config, self.catalog)
        self.assertEqual(plan["summary"]["pending"], 0)
        self.assertEqual([(r["legacy_id"], r["request"]["import_id"]) for r in plan["rows"]], [("665#2", 666), ("665#1", 665)])
        partial = build_plan([second], self.config, self.catalog)
        self.assertEqual(partial["rows"][0]["request"]["import_id"], 666)

    def test_number_reservation_keeps_duplicate_pairs_and_no_collisions(self):
        keys = ["665#1", "665#2", "666", "667", "1260", "1261#1", "1261#2", "1262"]
        rows = [{"legacy_id": k, "request": {"ok": True}, "errors": []} for k in keys]
        numbers = reserve_numbers(rows, {})
        self.assertEqual(numbers["665#1"], 665)
        self.assertEqual(numbers["665#2"], 666)
        self.assertEqual(numbers["666"], 667)
        self.assertEqual(numbers["1261#1"], 1261)
        self.assertEqual(numbers["1261#2"], 1262)
        self.assertEqual(len(set(numbers.values())), len(keys))
        self.assertEqual(reserve_numbers(list(reversed(rows)), numbers), numbers)

    def test_all_current_reservations_and_summaries_fit_schema(self):
        numbers = self.config["request_numbers"]
        self.assertEqual(len(numbers), 1680)
        self.assertEqual(len(set(numbers.values())), 1680)
        self.assertEqual(len(self.config["description_summaries"]), 25)
        self.assertTrue(all(0 < len(s["text"]) <= 300 for s in self.config["description_summaries"].values()))


if __name__ == "__main__":
    unittest.main()
