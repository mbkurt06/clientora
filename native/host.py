"""Clientora native host. Opens existing client directories only; no network."""
import json
import os
import re
import struct
import subprocess
import sys
from pathlib import Path

CONFIG = Path(__file__).resolve().with_name("config.json")
MARKER = ".clientora-filemanager-id"
UUID = re.compile(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}", re.I)

def safe_component(value):
    return (isinstance(value, str) and 0 < len(value) <= 255
            and value not in (".", "..")
            and not any(ord(c) < 32 or c in '\\/:*?"<>|' for c in value)
            and not value.endswith((" ", ".")))

def resolve_folder(config, message):
    if not isinstance(message, dict) or message.get("action") != "openFolder":
        raise ValueError("Unsupported request")
    marker = message.get("marker")
    if not isinstance(marker, str) or not UUID.fullmatch(marker):
        raise ValueError("Invalid folder marker")
    parts = message.get("parts")
    if (not isinstance(parts, list) or not 2 <= len(parts) <= 64
            or parts[0] != "Musteriler" or not all(safe_component(p) for p in parts)):
        raise ValueError("Invalid client folder")
    root = Path(config["root"]).resolve(strict=True)
    mark = (root / MARKER).resolve(strict=True)
    if mark.parent != root or not mark.is_file() or mark.stat().st_size > 128:
        raise ValueError("Folder marker missing or invalid; reconnect Clientora")
    if mark.read_text(encoding="utf-8").strip() != marker:
        raise ValueError("Wrong data folder; rerun native/install.py")
    # Reject directory aliases/symlinks that lead out of the selected client.
    clients = (root / "Musteriler").resolve(strict=True)
    if clients.parent != root:
        raise ValueError("Client directory escapes root")
    client = (clients / parts[1]).resolve(strict=True)
    if client.parent != clients or client.name != parts[1]:
        raise ValueError("Client directory mismatch")
    target = client.joinpath(*parts[2:]).resolve(strict=True)
    if not target.is_dir() or (target != client and client not in target.parents):
        raise ValueError("Target is not a directory inside this client")
    return target

def open_folder(target):
    if sys.platform == "darwin":
        command = ["/usr/bin/open", "-a", "Finder", str(target)]
    elif sys.platform == "win32":
        # A validated, existing directory; never execute a supplied file.
        os.startfile(str(target), "explore")
        return
    elif sys.platform.startswith("linux"):
        command = ["xdg-open", str(target)]
    else:
        raise ValueError("Unsupported operating system")
    subprocess.Popen(command, stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL,
                     stderr=subprocess.DEVNULL, start_new_session=True)

def read_message(stream):
    header = stream.read(4)
    if len(header) != 4:
        raise ValueError("Incomplete message")
    size = struct.unpack("=I", header)[0]
    if not 0 < size <= 65536:
        raise ValueError("Invalid message size")
    data = stream.read(size)
    if len(data) != size:
        raise ValueError("Incomplete message")
    return json.loads(data.decode("utf-8"))

def write_message(stream, result):
    body = json.dumps(result, ensure_ascii=True).encode("utf-8")
    stream.write(struct.pack("=I", len(body)) + body)
    stream.flush()

def main():
    if sys.platform == "win32":
        import msvcrt
        msvcrt.setmode(sys.stdin.fileno(), os.O_BINARY)
        msvcrt.setmode(sys.stdout.fileno(), os.O_BINARY)
    try:
        config = json.loads(CONFIG.read_text(encoding="utf-8"))
        if len(sys.argv) < 2 or sys.argv[1] != config["origin"]:
            raise ValueError("Extension origin not authorized")
        target = resolve_folder(config, read_message(sys.stdin.buffer))
        open_folder(target)
        result = {"ok": True}
    except Exception as exc:
        result = {"ok": False, "error": str(exc)[:500]}
    write_message(sys.stdout.buffer, result)

if __name__ == "__main__":
    main()
