"""Register the optional Clientora file-manager bridge for the current OS user."""
import argparse
import json
import os
from pathlib import Path
import re
import shlex
import shutil
import subprocess
import sys

HOST = "com.clientora.filemanager"

def choose_root():
    if sys.platform == "darwin":
        choice = subprocess.run(
            ["/usr/bin/osascript", "-e",
             'POSIX path of (choose folder with prompt "Select the existing Clientora data folder")'],
            capture_output=True, text=True)
        if choice.returncode == 0:
            return choice.stdout.strip()
    return input("Existing Clientora DATA folder (absolute path): ").strip().strip('"')

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--extension-id")
    parser.add_argument("--root")
    args = parser.parse_args()
    extension_id = (args.extension_id or input("Clientora extension ID (chrome://extensions): ")).strip()
    if not re.fullmatch(r"[a-p]{32}", extension_id):
        raise SystemExit("Invalid Chrome extension ID (32 letters a-p).")
    root = Path(args.root or choose_root()).expanduser().resolve(strict=True)
    def has_clients(p):
        return any((p / name).is_dir() for name in ("Kunden", "Musteriler"))
    if not has_clients(root) and has_clients(root / "Clientora"):
        root = (root / "Clientora").resolve(strict=True)
    if root.name != "Clientora" or not has_clients(root):
        raise SystemExit("Select the Clientora data folder created in the extension, not the source repository.")
    home = Path.home()
    if sys.platform == "darwin":
        appdir = home / "Library" / "Application Support" / "Clientora" / "Native"
        manifestdir = home / "Library" / "Application Support" / "Google" / "Chrome" / "NativeMessagingHosts"
    elif sys.platform.startswith("linux"):
        appdir = Path(os.environ.get("XDG_DATA_HOME", str(home / ".local" / "share"))) / "clientora" / "native"
        manifestdir = home / ".config" / "google-chrome" / "NativeMessagingHosts"
    elif sys.platform == "win32":
        appdir = Path(os.environ["LOCALAPPDATA"]) / "Clientora" / "Native"
        manifestdir = appdir
    else:
        raise SystemExit("Unsupported OS")
    appdir.mkdir(parents=True, exist_ok=True)
    manifestdir.mkdir(parents=True, exist_ok=True)
    appdir = appdir.resolve()
    target = appdir / "host.py"
    shutil.copyfile(Path(__file__).resolve().with_name("host.py"), target)
    origin = "chrome-extension://" + extension_id + "/"
    config = appdir / "config.json"
    config.write_text(json.dumps({"root": str(root), "origin": origin}), encoding="utf-8")
    if sys.platform != "win32":
        os.chmod(config, 0o600)
        launch = appdir / "launch"
        launch.write_text("#!/bin/sh\nexec " + shlex.quote(sys.executable) + " " +
                          shlex.quote(str(target)) + ' "$@"\n', encoding="utf-8")
        os.chmod(launch, 0o700)
    else:
        # Chrome's Windows host launcher supports .bat (official native messaging sample).
        launch = appdir / "launch.bat"
        if any(c in str(sys.executable) + str(target) for c in '%!\r\n"'):
            raise SystemExit("Unsupported characters in Python or installation path.")
        launch.write_text('@echo off\n"' + sys.executable + '" "' + str(target) + '" %*\n',
                          encoding="utf-8")
    manifest = manifestdir / (HOST + ".json")
    manifest.write_text(json.dumps({"name": HOST, "description": "Clientora local folder opener",
                                   "path": str(launch), "type": "stdio", "allowed_origins": [origin]},
                                   indent=2), encoding="utf-8")
    if sys.platform == "win32":
        import winreg
        with winreg.CreateKey(winreg.HKEY_CURRENT_USER,
                              r"Software\Google\Chrome\NativeMessagingHosts" + "\\" + HOST) as key:
            winreg.SetValueEx(key, "", 0, winreg.REG_SZ, str(manifest))
    print("Installed for Google Chrome. Return to Clientora and click Open in file manager.")
    print("Only this data folder is authorized:", root)
    print("No administrator rights or server required.")

if __name__ == "__main__":
    main()
