# Clientora v0.1.10 – Lokale Kundenverwaltung

Clientora ist eine experimentelle Chrome-Erweiterung für Kundenverwaltung, Aufgaben, Termine, Erinnerungen, Dokumente und Browser-Arbeitsbereiche. Vor dem Einsatz mit echten Kundendaten bitte mit fiktiven Daten testen.

## Installation und Aktualisierung

1. Repository herunterladen oder mit `git pull origin main` aktualisieren.
2. `chrome://extensions` öffnen, Entwicklermodus aktivieren, den Ordner mit manifest.json als entpackte Erweiterung laden bzw. die bestehende Erweiterung aktualisieren. Nicht deinstallieren, da lokale Metadaten verloren gehen können.
3. Clientora öffnen, einen lokalen Speicherordner auswählen und bei Bedarf eine verschlüsselte Sicherung einrichten.

## Version 0.1.10

- Ein Klick auf ein unterstütztes Dokument öffnet die Originaldatei in der Standardanwendung des Betriebssystems. Keine erneute Kopie im Downloadordner. Änderungen werden in der Originaldatei gespeichert, wenn der Editor diese normal speichert. Das lokale Hilfsprogramm muss einmal mit `python3 native/install.py` bzw. `py -3 native/install.py` aktualisiert werden. PDF, Bilder und Text bieten zusätzlich eine Browservorschau ohne Download. Aus Sicherheitsgründen werden ausführbare Dateien und nicht erlaubte Typen nicht automatisch gestartet.
- Neue deutsche Musterdateien enthalten zwei bearbeitbare DOCX-Dokumente (Begleitschreiben und Beratungsnotiz) statt TXT. Bereits vorhandene TXT-Dateien werden nicht gelöscht oder überschrieben.

## Version 0.1.9

- Deutsch ist die Standardsprache; Englisch und Türkisch sind in den Einstellungen wählbar. Bereits ausdrücklich gewählte Sprachen bleiben erhalten. Automatische Sprachauswahl ist weiterhin möglich.
- Demokunden, Aufgaben, Notizen, Termine, Erinnerungen, Vorlagen und neue Musterdateien sind deutsch. Bestehende Demodatensätze werden anhand bekannter Beispieltexte übersetzt; echte Kundendaten bleiben unverändert. Bestehende Dateien werden nicht überschrieben. Neue deutsche MUSTER-Dateien werden zusätzlich im Dokumente-Ordner erstellt.
- Neue Datenordner: Clientora/Kunden, Clientora/Sicherungen, Clientora/Vorlagen. Bestehende türkisch benannte Ordner bleiben auf der Festplatte erhalten und werden weiterverwendet. Alte Unterordner werden in Clientora mit deutschen Anzeigenamen dargestellt. Vorhandene Kundenordner behalten ihre physischen Namen.
- Bei neuen deutschen Datenordnern muss der optionale Dateimanager-Helfer aktualisiert werden.

## Funktionen und Grenzen

- Kundenübersicht, Archivierung und Reaktivierung, individuelle Felder, wiederverwendbare Vorlagen, Dokumenten-Checklisten, Notizen, Aufgaben, Kalender, Erinnerungen.
- Lokale Dateien und Ordner, standardmäßig Dokumente. Frei wählbare Unterordner. Browser-Downloads lassen sich nur bei sicher zugeordneten Clientora-Linkdownloads und korrekt gesetztem Downloadpfad automatisch zuordnen; normale Downloads müssen manuell zugeordnet werden.
- Getrennte Browserfenster sind keine getrennten Chrome-Profile. Cookies und Websitzungen werden geteilt. Vor jeder Anmeldung das Konto prüfen.
- Passworttresor und Metadaten-Sicherung verwenden PBKDF2 und AES-GCM. Dokumente werden nicht separat verschlüsselt. Ordner und Sicherungen können über einen lokal synchronisierten Cloud-Ordner gesichert werden; Clientora nutzt keine Cloud-API. Gleichzeitiger Betrieb mehrerer Installationen mit einem Datenbestand wird nicht unterstützt.
- Optionale automatische verschlüsselte Sicherung, wenn Chrome läuft und Ordnerzugriff besteht. Passwörter sicher aufbewahren. Erinnerungen können bei geschlossenem Chrome verspätet erscheinen.
- Optionaler Dateimanager-Helfer: macOS/Linux `python3 native/install.py`, Windows `py -3 native/install.py`. Erweiterungs-ID und Clientora-Datenordner angeben. Keine Administratorrechte oder Netzwerkverbindung erforderlich. Nur für das Öffnen von Kundenordnern nötig.
- Echte Chrome-Integration, Betriebssysteme, Dateiberechtigungen und Datenschutz/Sicherheit müssen vor produktivem Einsatz geprüft werden.
