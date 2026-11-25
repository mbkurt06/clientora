# Clientora v0.1.15 – Lokale Kundenverwaltung

Clientora ist eine experimentelle Chrome-Erweiterung für Kundenverwaltung, Aufgaben, Termine, Erinnerungen, Dokumente und Browser-Arbeitsbereiche. Vor dem Einsatz mit echten Kundendaten bitte mit fiktiven Daten testen.

## Komplettpaket

Sobald der Build erfolgreich veröffentlicht ist: [GitHub Releases](https://github.com/mbkurt06/clientora/releases) → Clientora-Komplett.zip. Das Paket enthält Chrome-Erweiterung, Setup/Windows, Setup/macOS und Setup/Linux sowie die Installationsanleitung. Alternativ gibt es ZIP-Pakete für einzelne Betriebssysteme. Go wird nur auf dem Buildserver benötigt. Der automatische GitHub-Quellcode-Download (Code → Download ZIP) enthält keine kompilierten Setup-Dateien. Testpakete sind nicht öffentlich signiert/notarisiert. Die Erweiterung muss vorerst im Entwicklermodus geladen werden; vorhandene Installationen können den Chrome-Schritt überspringen.

## Installation und Aktualisierung

1. Repository herunterladen oder mit `git pull origin main` aktualisieren.
2. `chrome://extensions` öffnen, Entwicklermodus aktivieren, den Ordner mit manifest.json als entpackte Erweiterung laden bzw. die bestehende Erweiterung aktualisieren. Nicht deinstallieren, da lokale Metadaten verloren gehen können.
3. Clientora öffnen, einen lokalen Speicherordner auswählen und bei Bedarf eine verschlüsselte Sicherung einrichten.

## Version 0.1.14

- Go-Helfer: Fehlerhafte Escape-Sequenz bei der Pfadprüfung korrigiert; Regressionstest für unzulässige Dateinamen ergänzt.

## Version 0.1.13

- Dokumente: vorhandene lokale Dateien auswählen und kopieren (auch Mehrfachauswahl oder Drag-and-drop). Originale außerhalb des Kundenordners bleiben unverändert.
- Neue leere Word- (.docx), Excel- (.xlsx), Text- und CSV-Dokumente erstellen, Namen eingeben und wahlweise direkt in der Standardanwendung öffnen. Der aktuelle Unterordner wird verwendet, sonst Dokumente. Gleiche Dateinamen erhalten einen Nummernzusatz. Erstellen ist ohne Helper möglich; direktes Öffnen benötigt den installierten Helper.

## Version 0.1.12

- Go-basierter Setup-Assistent für Windows, macOS und Debian/Ubuntu; kein Python für die neue Einrichtung. Bestehende Entwickler-Erweiterung: Chrome-Schritt überspringen, ID eingeben und Datenordner auswählen. Bestehende Helper-Konfiguration wird als Vorschlag übernommen. Web-Store-Installation wird erst nach Vergabe einer offiziellen ID aktiviert.
- Build-Workflow erstellt unsignierte Testpakete; Buildstatus und Artefakte unter GitHub Actions. Veröffentlichung und echte OS-/Chrome-Tests stehen aus. Die bisherige Python-Einrichtung bleibt als Rückfalloption erhalten. Siehe native/README.md.

## Version 0.1.11

- Vorlagen können jederzeit nach der Kundenerstellung vollständig oder nur für einen Bereich angewendet werden: Kundeninformationen, Unterlagen-Checkliste, Aufgaben, Notizen, Webseiten, Dokumente, Termine und Erinnerungen. Der Kalender bietet Termin- und Erinnerungsvorlagen. Die Auswahl zeigt nur Vorlagen mit passenden Einträgen und eine Vorschau der Anzahl. Bestehende Daten werden nicht überschrieben, gleiche Einträge werden übersprungen.
- Neue Vorlagenbausteine für allgemeine Notizen, Termine und Erinnerungen. Termine und Erinnerungen verwenden eine relative Tageszahl und Uhrzeit, ausgehend vom bei der Anwendung gewählten Startdatum. Bereits vorhandene gleichnamige Einträge behalten ihren Zustand und Termin. Passworttresor und Verlauf sind bewusst nicht als Vorlagen verfügbar.
- Eine Vorlage kann in mehreren Bereichen unabhängig verwendet werden; die Kundeninformationen zeigen die angewendeten Bereiche. Kein automatisches Verteilen späterer Änderungen.

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
