import unittest
from unittest.mock import Mock

from fastapi import HTTPException
from pydantic import ValidationError

from app.api.request.router import change_status
from app.api.request.schemas import UpdateRequestStatus
from app.api.request.service import update_request_status
from tests.test_request_service import RecordingConnection


class RequestStatusTests(unittest.TestCase):
    def connection(self, rows):
        connection = RecordingConnection(rows)
        connection.commit = Mock()
        connection.rollback = Mock()
        return connection

    def test_change_uses_catalog_id_and_commits_without_changing_other_fields(self):
        connection = self.connection([[{"status": 1}], [{"id": 27}], []])
        update_request_status(connection, 104, 27)
        self.assertIn("FOR UPDATE", connection.statements[0])
        self.assertIn("SET ID_REQUEST_STATUS=:status_id", connection.statements[2])
        self.assertEqual(connection.parameters[2], {"request_id": 104, "status_id": 27})
        self.assertNotIn("DATE", connection.statements[2].split("SET", 1)[1])
        connection.commit.assert_called_once()
        connection.rollback.assert_not_called()

    def test_same_status_is_idempotent(self):
        connection = self.connection([[{"status": 2}], [{"id": 2}]])
        update_request_status(connection, 104, 2)
        self.assertEqual(len(connection.statements), 2)
        connection.commit.assert_called_once()

    def test_missing_request_returns_404_without_writing(self):
        connection = self.connection([[]])
        with self.assertRaises(HTTPException) as error:
            change_status(104, UpdateRequestStatus(statusId=2), connection)
        self.assertEqual(error.exception.status_code, 404)
        connection.commit.assert_not_called()
        connection.rollback.assert_called_once()

    def test_unknown_status_returns_422_without_writing(self):
        connection = self.connection([[{"status": 1}], []])
        with self.assertRaises(HTTPException) as error:
            change_status(104, UpdateRequestStatus(statusId=999), connection)
        self.assertEqual(error.exception.status_code, 422)
        self.assertEqual(len(connection.statements), 2)
        connection.commit.assert_not_called()
        connection.rollback.assert_called_once()

    def test_commit_failure_rolls_back(self):
        connection = self.connection([[{"status": 1}], [{"id": 2}], []])
        connection.commit.side_effect = RuntimeError("unavailable")
        with self.assertRaises(RuntimeError):
            update_request_status(connection, 104, 2)
        connection.rollback.assert_called_once()

    def test_status_requires_positive_integer(self):
        for value in (0, -1, 1.5, "2", True, None):
            with self.subTest(value=value), self.assertRaises(ValidationError):
                UpdateRequestStatus(statusId=value)
