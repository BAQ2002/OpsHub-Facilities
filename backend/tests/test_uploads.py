import base64
import unittest
from pydantic import ValidationError
from app.api.uploads import UploadedFile, MAX_FILE_BYTES


class UploadTests(unittest.TestCase):
    def test_valid_binary(self):
        content = base64.b64encode(b"\x00\xff").decode()
        self.assertEqual(UploadedFile(fileName="foto.jpg", mimeType="image/jpeg", contentBase64=content).contentBase64, content)

    def test_rejects_invalid_content_and_headers(self):
        for fields in ({"contentBase64": "%%%"}, {"mimeType": "text/html\r\nX-Test: injected"},
                       {"fileName": "x" * 256},
                       {"contentBase64": base64.b64encode(b"x" * (MAX_FILE_BYTES + 1)).decode()}):
            with self.subTest(fields=list(fields)), self.assertRaises(ValidationError):
                UploadedFile(**(dict(fileName="foto.jpg", mimeType="image/jpeg", contentBase64="eA==") | fields))
