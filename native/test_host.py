import tempfile
import unittest
from pathlib import Path
from host import resolve_folder, MARKER, read_message, write_message
import io

class HostTests(unittest.TestCase):
    def test_scope(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp) / "Clientora"
            client = root / "Musteriler" / "000001_Test"
            nested = client / "Documents"
            nested.mkdir(parents=True)
            marker = "12345678-1234-1234-1234-123456789abc"
            (root / MARKER).write_text(marker)
            config = {"root": str(root)}
            msg = {"action": "openFolder", "marker": marker, "parts": ["Musteriler", client.name, nested.name]}
            self.assertEqual(resolve_folder(config, msg), nested.resolve())
            self.assertEqual(resolve_folder(config, {**msg, "parts": ["Musteriler", client.name]}), client.resolve())
            for parts in [["Musteriler", client.name, ".."], ["Musteriler", client.name, "/tmp"], ["Yedekler", "foo"]]:
                with self.assertRaises(ValueError):
                    resolve_folder(config, {**msg, "parts": parts})
            with self.assertRaises(ValueError):
                resolve_folder(config, {**msg, "marker": "87654321-1234-1234-1234-123456789abc"})
            outside = root / "outside"
            outside.mkdir()
            try:
                (client / "escape").symlink_to(outside, target_is_directory=True)
            except (OSError, NotImplementedError):
                pass
            else:
                with self.assertRaises(ValueError):
                    resolve_folder(config, {**msg, "parts": ["Musteriler", client.name, "escape"]})
    def test_protocol(self):
        stream = io.BytesIO()
        write_message(stream, {"ok": True})
        stream.seek(0)
        self.assertEqual(read_message(stream), {"ok": True})

if __name__ == "__main__":
    unittest.main()
