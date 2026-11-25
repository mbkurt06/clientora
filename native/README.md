# Clientora Setup (Go)

Ein Paket pro Betriebssystem, kein Python und keine Go-Installation für Endnutzer. Windows verwendet Systemdialoge über PowerShell/.NET, macOS AppleScript, Debian/Ubuntu Zenity als Paketabhängigkeit. Der Assistent kopiert den Helfer und registriert Native Messaging für die ausgewählte Erweiterungs-ID. Keine Chrome-Richtlinien, kein erzwungenes Installieren von Erweiterungen. Vorhandene Daten bleiben erhalten.

Entwicklermodus: „Überspringen“ wählen, Erweiterungs-ID aus chrome://extensions angeben, Clientora-Datenordner wählen. Nach Web-Store-Veröffentlichung die bestätigte Store-ID beim Build mit -ldflags "-X main.storeID=..." setzen. Der Benutzer muss die Erweiterung selbst hinzufügen.

Build (Entwickler): cd native && go test ./... && go build -o clientora-setup .
GitHub Actions baut Windows-EXE, universelles macOS-DMG (Intel/Apple Silicon) und Debian-Pakete. Nach erfolgreichem Build werden die komplette ZIP-Datei und die betriebssystemspezifischen ZIP-Dateien als Vorabversion unter GitHub Releases veröffentlicht. Testpakete sind nicht öffentlich signiert/notarisiert. Für öffentliche Distribution signieren/notarisieren.
