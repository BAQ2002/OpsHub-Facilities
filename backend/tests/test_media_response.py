import unittest

from fastapi import HTTPException

from backend.app.api.media_response import media_response
from backend.app.api.request_task.router import media as request_task_media
from backend.app.api.service_catalog.router import request_media


class MediaResponseTests(unittest.TestCase):
    def test_builds_binary_response_with_safe_headers(self):
        response = media_response(
            {
                "content": b"image-content",
                "file_name": 'vistoria verão "final".jpg',
                "mime_type": "image/jpeg",
            },
            max_age=300,
        )

        self.assertEqual(response.body, b"image-content")
        self.assertEqual(response.media_type, "image/jpeg")
        self.assertEqual(response.headers["cache-control"], "private, max-age=300")
        self.assertEqual(
            response.headers["content-disposition"],
            "inline; filename=\"media\"; filename*=UTF-8''vistoria%20ver%C3%A3o%20%22final%22.jpg",
        )
        self.assertEqual(
            response.headers["content-security-policy"],
            "default-src 'none'; sandbox",
        )
        self.assertEqual(response.headers["x-content-type-options"], "nosniff")

    def test_uses_safe_defaults_for_nullable_metadata(self):
        response = media_response(
            {"content": b"content", "file_name": None, "mime_type": None},
            max_age=3600,
        )

        self.assertEqual(response.media_type, "application/octet-stream")
        self.assertEqual(response.headers["cache-control"], "private, max-age=3600")
        self.assertIn("filename*=UTF-8''media", response.headers["content-disposition"])

    def test_media_routes_reject_non_positive_identifiers_before_querying(self):
        for route in (request_media, request_task_media):
            with self.subTest(route=route.__name__), self.assertRaises(
                HTTPException
            ) as raised:
                route(0, None)

            self.assertEqual(raised.exception.status_code, 400)
            self.assertEqual(
                raised.exception.detail, "Identificador de mídia inválido."
            )


if __name__ == "__main__":
    unittest.main()
