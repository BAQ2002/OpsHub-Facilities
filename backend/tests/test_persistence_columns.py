import os
import unittest



from backend.app.api.request.schemas import CreateRequest
from backend.app.api.request.service import create_request
from backend.app.api.request_task.schemas import VisitPayload
from backend.app.api.request_task.service import save_visit
from backend.tests.test_request_service import RecordingConnection


class WriteConnection(RecordingConnection):
    def __init__(self, result_sets):
        super().__init__(result_sets)
        self.committed = False

    def commit(self):
        self.committed = True


class PersistenceColumnTests(unittest.TestCase):
    def test_create_request_uses_membership_column(self):
        connection = WriteConnection([[{"id_business": 1}], [{"id": 1}], [{"id": 42}]])
        result = create_request(connection, CreateRequest(
            businessId=1, regionId=2, locationId=3, serviceTypeId=4,
            description="Teste", additionalFields=[],
        ))
        self.assertEqual(result, 42)
        self.assertIn("ID_MEMBERSHIP_REQUESTER", connection.statements[2])
        self.assertNotIn("ID_MEMBER_REQUESTER", connection.statements[2])
        self.assertTrue(connection.committed)

    def test_create_and_update_visit_use_physical_dates_and_relationship(self):
        data = VisitPayload(requestId=42, description="Visita",
                            startDatetime="2026-09-24T08:00:00",
                            stopDatetime="2026-09-24T09:00:00", memberIds=[7])
        for visit_id, results in [(None, [[{"id": 5}], []]), (5, [[], [], []])]:
            with self.subTest(visit_id=visit_id):
                connection = WriteConnection(results)
                self.assertEqual(save_visit(connection, data, visit_id), 5)
                sql = "\n".join(connection.statements)
                self.assertIn("STARTED_DATE", sql)
                self.assertIn("FINISHED_DATE", sql)
                self.assertIn("ID_REQUEST_TASK", sql)
                self.assertNotRegex(sql, r"\b(?:START_DATETIME|STOP_DATETIME|ID_TASK)\b")
                self.assertEqual(connection.parameters[0]["range_start"].isoformat(), data.startDatetime)
                self.assertEqual(connection.parameters[0]["stop"].isoformat(), data.stopDatetime)
                self.assertTrue(connection.committed)
