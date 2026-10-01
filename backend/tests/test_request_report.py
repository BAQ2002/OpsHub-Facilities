import unittest
from datetime import date, datetime
from io import BytesIO
from unittest.mock import Mock, patch

from fastapi import HTTPException
from pypdf import PdfReader

from backend.app.api.request.report import build_report
from backend.app.api.request.report_data import collect_report
from backend.app.api.request.router import report
from backend.tests.test_request_service import RecordingConnection


def sample_data():
    return {
        "records": [{
            "request": {"id": 42, "id_location": 3, "id_membership_responder": None,
                        "created_date": datetime(2026, 9, 30, 23, 59), "agreed_date": None,
                        "started_date": None, "finished_date": None, "canceled_date": None,
                        "description": "Inspeção <pendente> & manutenção"},
            "request_status": {"description": "Em aberto"}, "category": {"name": "Elétrica"},
            "location": {"name": "Sala A"}, "region": {"name": "Térreo"},
            "business": {"name": "Unidade A"}, "service_type": {"name": "Iluminação"},
            "request_type": {"name": "Chamado"}, "requester": {"name": "Ana"},
        }],
        "members": [], "extracted_at": "2026-09-30T23:00:00-03:00",
        **{key: [] for key in ("tasks", "fields", "transactions", "checklists", "checklist_values", "executors", "media")},
    }


class ReportTests(unittest.TestCase):
    def test_filters_are_bound_and_reused_for_every_related_collection(self):
        c = RecordingConnection([[], sample_data()["records"], []] + [[]] * 8)
        collect_report(c, date(2026, 1, 1), date(2026, 9, 30), "  %' OR 1=1 -- ", 7, [2, 4], [1, 3])
        self.assertEqual(c.parameters[1]["range_end"], datetime(2026, 10, 1))
        self.assertEqual(c.parameters[1]["business"], 7)
        self.assertNotIn("OR 1=1 --", c.statements[1])
        for sql, params in zip(c.statements[3:], c.parameters[3:]):
            self.assertIn("R.ID IN (SELECT R.ID", sql)
            self.assertIn("R.ID_REQUEST_STATUS IN", sql)
            self.assertIn("ST.ID_SERVICE_CATEGORY IN", sql)
            self.assertEqual(params, c.parameters[1])

    def test_empty_selection_has_clear_error(self):
        with self.assertRaisesRegex(ValueError, "Nenhum chamado"):
            collect_report(RecordingConnection([[], []]), date(2026, 1, 1), date(2026, 9, 30))

    def test_invalid_dates_do_not_query(self):
        c = Mock()
        with self.assertRaises(HTTPException) as error:
            report(date(2026, 10, 1), date(2026, 9, 30), None, None, [], [], c)
        self.assertEqual(error.exception.status_code, 422)
        c.execute.assert_not_called()

    def test_pdf_includes_period_filters_counts_details_and_bookmarks(self):
        content = build_report(sample_data(), date(2026, 9, 1), date(2026, 9, 30), "Status: Em aberto; Busca: Iluminação")
        self.assertTrue(content.startswith(b"%PDF-"))
        pdf = PdfReader(BytesIO(content))
        text = "\n".join(page.extract_text() for page in pdf.pages)
        for value in ["01/09/2026 a 30/09/2026", "Status: Em aberto", "Elétrica", "Sala A", "#42", "Inspeção <pendente> & manutenção", "1 chamados"]:
            self.assertIn(value, text)
        self.assertEqual(len(pdf.outline), 7)

    def test_download_response_and_all_filters_forwarded(self):
        with patch("backend.app.api.request.report_data.collect_report", return_value=sample_data()) as collect:
            response = report(date(2026, 9, 1), date(2026, 9, 30), "Iluminação", 7, [2, 4], [1], Mock())
        self.assertEqual(collect.call_args.args[1:], (date(2026, 9, 1), date(2026, 9, 30), "Iluminação", 7, [2, 4], [1]))
        self.assertEqual(response.media_type, "application/pdf")
        self.assertEqual(response.headers["cache-control"], "no-store")
        self.assertIn("2026-09-01_a_2026-09-30.pdf", response.headers["content-disposition"])

    def test_corrupt_image_does_not_prevent_download(self):
        data = sample_data()
        data["media"] = [{"id": 1, "report_request_id": 42, "kind": "request", "file_name": "corrupt.png", "created_date": None, "mime_type": "image/png", "content": b"invalid"}]
        pdf = PdfReader(BytesIO(build_report(data, date(2026, 9, 1), date(2026, 9, 30), "Todos")))
        self.assertIn("Não foi possível renderizar", "\n".join(p.extract_text() for p in pdf.pages))


if __name__ == "__main__":
    unittest.main()
