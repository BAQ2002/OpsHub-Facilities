import hashlib
import json
import re
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from database.import_tickets.media import cache_key, read_asset, urls, prepare_media, require_media
from database.import_tickets.export_sql import insert_sql


class MediaTests(unittest.TestCase):
    def test_placeholder_is_not_an_attachment_and_urls_are_deduplicated(self):
        self.assertEqual(urls('https://a.test/not-found-deskbee.jpg'), [])
        self.assertEqual(urls('https://a.test/a.jpg https://a.test/a.jpg'), ['https://a.test/a.jpg'])

    def test_cache_checks_binary_integrity_and_sql_reconstructs_exact_bytes(self):
        content = bytes(range(256)) * 11
        url = 'https://example.test/photo.png'
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            key = cache_key(url)
            (root / (key + '.bin')).write_bytes(content)
            (root / (key + '.json')).write_text(json.dumps({'file_name': 'photo.png',
                'mime_type': 'image/png', 'sha256': hashlib.sha256(content).hexdigest()}))
            asset = read_asset(url, root)
            statement = insert_sql('OHFC_SERVICE_FIELD_MEDIA', {
                'ID': 1, 'ID_REQUEST': 665, 'ID_SERVICE_FIELD_TYPE': 2, **asset})
            pieces = re.findall(r"WRITEAPPEND\(media_blob, (\d+), HEXTORAW\('([0-9a-f]+)'\)\)", statement)
            self.assertTrue(pieces)
            self.assertEqual(b''.join(bytes.fromhex(h) for _, h in pieces), content)
            self.assertTrue(all(len(bytes.fromhex(h)) == int(n) for n, h in pieces))
            self.assertIn('RETURNING CONTENT INTO media_blob', statement)
            self.assertNotIn(url, statement)
            (root / (key + '.bin')).write_bytes(b'corrupt')
            with self.assertRaisesRegex(ValueError, 'alterado'):
                read_asset(url, root)

    def test_missing_and_expired_media_block_load_without_network(self):
        plan = {'rows': [{'request': {'import_id': 1, 'fields': [
            {'name': 'Foto', 'definition': {'type': 'MEDIA'},
             'value': ['https://example.test/a.jpg?Expires=1']} ]}}]}
        with tempfile.TemporaryDirectory() as folder, patch('urllib.request.urlopen') as fetch:
            result = prepare_media(plan, download=True, directory=folder)
            self.assertEqual(result['missing_references'], 1)
            self.assertIn('expirada', result['entries'][0]['error'])
            fetch.assert_not_called()
        with self.assertRaisesRegex(ValueError, 'Carga bloqueada'):
            require_media(plan)
