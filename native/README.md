# Native Helper

Der Go-Quellcode wird separat im Branch native-build gepflegt. Der Build-Workflow in main verwendet den festgelegten Quellcode-Commit 368db5e570199e3e4ff91379907021b3f3936781. Bei Änderungen am Helfer muss dieser Commit im Workflow aktualisiert werden.

Endnutzer benötigen Go nicht. Nach erfolgreichem Build stehen die kompilierten Setup-Dateien unter Setup/Windows, Setup/macOS und Setup/Linux zur Verfügung. Python-Dateien in diesem Ordner sind nur eine vorübergehende Rückfalloption für bisherige Entwicklerinstallationen. Testpakete sind nicht öffentlich signiert/notarisiert.
