# isiQuint Editor — Benutzerhandbuch

Der isiQuint Editor ist ein browserbasierter Partitur-Editor für Geigenlehrkräfte.
Er ermöglicht das Erstellen, Bearbeiten und Abspielen von Partituren mit farbigen Notenlinien nach der isiQuint-Methode.

---

## 1. Editor öffnen

- Über **„Editor öffnen"** auf der Startseite oder im Navigationmenü
- Über **„Jetzt starten"** auf der Startseite
- Aus dem Repertoire: Auf ein Stück klicken lädt es direkt im Editor

---

## 2. Oberfläche

```
┌─────────────────────────────────────────────────────┐
│  [Logo]  [Titel]  [Gespeichert]   [↶] [↷] [⌫] [.ly] [PDF] [Speichern]  │
├─────────────────────────────────────────────────────┤
│  [𝅝] [𝅗𝅥] [♩] [♪] [𝅘𝅥𝅯]  [.]  [♯] [♭] [♮]  [Pause]  [+Takt] [−Takt] [Kopieren] [Einfügen] [Duplizieren] [←] [→] │
├─────────────────────────────────────────────────────┤
│  Takt 1/4  (0/4 Zeitwerte)        [1][2][3][4]     │
├──────────────────────────────────────┬──────────────┤
│                                      │  Tonart      │
│         Notenzeile (VexFlow)         │  Taktart     │
│                                      │  Tempo       │
│                                      │  Doigtés     │
├──────────────────────────────────────┴──────────────┤
│  [A3] [B3] [C4] [D4] [E4] [F4] [G4] [A4] [B4]    │
└─────────────────────────────────────────────────────┘
```

---

## 3. Noten eingeben

### Per Maus
1. Gewünschte **Notendauer** in der Toolbar wählen (𝅝, 𝅗𝅥, ♩, ♪, 𝅘𝅥𝅯)
2. Optional: **Vorzeichen** (♯, ♭, ♮) und **Punktierung** (.) aktivieren
3. Auf die entsprechende **Note** in der unteren Leiste klicken (A3–B4)

### Per Tastatur
Direkt folgende Tasten drücken:

| Taste | Note | Oktave |
|-------|------|--------|
| A | A | 3 |
| B | B | 3 |
| C | C | 4 |
| D | D | 4 |
| E | E | 4 |
| F | F | 4 |
| G | G | 4 |

Die Note wird automatisch mit der aktuell gewählten Dauer eingefügt.

### Pause einfügen
- **R** drücken oder **„Pause"**-Button klicken
- Der Modus wechselt zwischen Note und Pause

### Vorzeichen
- **♯** (Kreuz): Erhöht die Note um einen Halbton
- **♭** (Beispiel): Senkt die Note um einen Halbton
- **♮** (Auflösungszeichen): Hebt ein Vorzeichen auf

### Punktierung
- **.** drücken oder Button klicken
- Verlängert die Note um die Hälfte (z.B. ♩. = 1.5 Beats)

---

## 4. Takte verwalten

### Takt hinzufügen
- **+ Takt**-Button in der Toolbar
- Oder **+** auf der Tastatur drücken
- Wird automatisch am Ende angefügt

### Takt löschen
- **− Takt**-Button klicken (nur wenn mehr als 1 Takt vorhanden)
- Der aktive Takt wird gelöscht

### Takt navigieren
- **←** / **→** Pfeiltasten: Vorheriger / Nächster Takt
- Auf die **Takt-Nummern** in der Leiste klicken

### Takt verschieben
- **Shift + ←** / **Shift + →**: Aktuellen Takt nach links/rechts verschieben
- Oder **←** / **→** Buttons in der Toolbar

### Takt kopieren
- **Ctrl + C** oder **„Kopieren"**-Button
- Kopiert den aktuellen Takt in die Zwischenablage

### Takt einfügen
- **Ctrl + V** oder **„Einfügen"**-Button
- Fügt den kopierten Takt nach dem aktuellen Takt ein

### Takt duplizieren
- **Ctrl + D** oder **„Duplizieren"**-Button
- Erstellt eine Kopie des aktuellen Takts danach

### Takt per Drag & Drop verschieben
- In der **Takt-Leiste** (Nummern 1, 2, 3...) einen Takt **anklicken und ziehen**
- Die Takte werden automatisch neu sortiert

---

## 5. Letztes Element löschen

- **⌫**-Button oder **Backspace** / **Delete**-Taste
- Löscht das zuletzt eingefügte Element im aktuellen Takt
- Wenn der Takt leer ist und mehrere Takte vorhanden, wird der Takt gelöscht

---

## 6. Undo / Redo

| Aktion | Tastatur | Button |
|--------|----------|--------|
| Rückgängig | **Ctrl + Z** | ↶ |
| Wiederherstellen | **Ctrl + Y** oder **Ctrl + Shift + Z** | ↷ |

---

## 7. Einstellungen (Sidebar)

### Tonart
- **C-Dur**, **G-Dur**, **D-Dur**, **F-Dur**, **D-Moll**, **A-Moll**, **E-Moll**
- Wird im Notenschlüssel angezeigt

### Taktart
- **4/4**, **3/4**, **2/4**, **6/8**
- Bestimmt die Beat-Kapazität pro Takt

### Tempo
- Regler von **40 bis 160 BPM**
- Beeinflusst die Abspielgeschwindigkeit

### Doigtés anzeigen
- Checkbox aktivieren/deaktivieren
- Zeigt die Fingerung (0–4) über den Noten an

---

## 8. Abspielen

- **▶**-Button: Startet die Wiedergabe der gesamten Partitur
- **⏸**-Button: Pausiert die Wiedergabe
- **■**-Button: Stoppt die Wiedergabe
- Während der Wiedergabe wird die aktuelle Note angezeigt

---

## 9. Import

- **Import**-Button in der Header-Leiste öffnet den Import-Dialog
- **Drag & Drop** oder Klick zur Dateiauswahl

### Unterstützte Formate

| Format | Endung | Beschreibung |
|--------|--------|--------------|
| MuseScore | `.mscz` | ZIP-Archiv mit MusicXML |
| MuseScore (XML) | `.mscx` | MusicXML im MuseScore-Format |
| MusicXML | `.musicxml` | Standard MusicXML |
| MXL | `.mxl` | ZIP-Archiv mit MusicXML |
| MIDI | `.mid`, `.midi` | Standard MIDI |

### Ablauf
1. **Import**-Button klicken
2. Datei auswählen oder per Drag & Drop einfügen
3. Die Partitur wird geladen und im Editor angezeigt
4. Automatisch in den Undo-Stack aufgenommen (Ctrl+Z zum Rückgängig)

---

## 10. Export

### PDF-Export
- **PDF ▾**-Button in der Header-Leiste öffnet ein Dropdown-Menü
- **Schwarz-weiß**: Option für druckfreundlichen Export (alle Linien schwarz)
- **Farbig**: Standard-Export mit isiQuint-farbigen Linien (Gelb, Schwarz, Rot, Schwarz, Blau)
- Titelfarbe passt sich automatisch an den Export-Modus an

### LilyPond-Export
- **.ly**-Button in der Header-Leiste
- Erzeugt eine LilyPond-Datei für professionellen Notensatz
- Enthält die isiQuint-Farbcallbacks für farbige Linien

### MusicXML-Export
- **.xml**-Button in der Header-Leiste
- Erzeugt eine MusicXML-Datei
- Kompatibel mit MuseScore, Sibelius, Finale und anderen Notationsprogrammen

### MuseScore-Export
- **.mscz**-Button in der Header-Leiste
- Erzeugt eine MuseScore-Datei (ZIP-Archiv)
- Direkt in MuseScore öffnen und weiterbearbeiten

### Export-Zusammenfassung

| Button | Format | Verwendung |
|--------|--------|------------|
| `.ly` | LilyPond | Professioneller Notensatz |
| `.xml` | MusicXML | Austausch zwischen Programmen |
| `.mscz` | MuseScore | Weiterarbeit in MuseScore |
| `PDF ▾` | PDF (farbig/schwarz-weiß) | Drucken, Teilen |

---

## 11. Teilen & Versionierung

### Partitur teilen
- **🔗**-Button: Öffnet den Share-Dialog
- **Berechtigung wählen**: Nur lesen oder Lesen + Schreiben
- **Ablaufzeit**: Optional (1h, 24h, 7 Tage, 30 Tage oder dauerhaft)
- Der generierte Link kann versendet werden

### Versionsverlauf
- **↻**-Button: Öffnet den Versionsverlauf
- **Snapshot speichern**: Aktuelle Version mit optionalem Label sichern
- **Wiederherstellen**: Eine frühere Version wiederherstellen

---

## 12. Responsive Verhalten

### Desktop
- Sidebar rechts sichtbar (Einstellungen immer zugänglich)

### Tablet / Mobil
- Sidebar über **⚙-Button** (unten rechts) als Overlay öffnen
- Einstellungen in einem Sheet auf der rechten Seite

---

## 13. Speichern

- **„Speichern"**-Button: Manuelles Speichern in Supabase
- **Auto-Save**: Speichert automatisch alle 30 Sekunden
- Status-Anzeige: „Gespeichert" / „Nicht gespeichert"

---

## 14. Tastaturübersicht

| Taste | Aktion |
|-------|--------|
| A–G | Note einfügen |
| R | Pause-Modus umschalten |
| . | Punktierung umschalten |
| + | Neuen Takt hinzufügen |
| ← / → | Takt wechseln |
| Shift + ← / → | Takt verschieben |
| Backspace / Delete | Letztes Element löschen |
| Escape | Zurück zum ersten Takt |
| Ctrl + Z | Rückgängig |
| Ctrl + Y / Ctrl + Shift + Z | Wiederherstellen |
| Ctrl + C | Takt kopieren |
| Ctrl + V | Takt einfügen |
| Ctrl + D | Takt duplizieren |

---

## 15. Schüler:innen-Modus (Üben)

Der Übungsmodus ist eine Read-only-Ansicht für Schüler:innen, die über einen Share-Link erreichbar ist.

### Zugang
1. Im Editor **🔗 teilen**-Button klicken
2. **Nur lesen**-Berechtigung wählen
3. Den **Übungslink** kopieren (erscheint unter dem Editor-Link)
4. Link an Schüler:innen senden → öffnet `/practice/[token]`

### Funktionen
- **Takt-für-Takt-Navigation**: ← Zurück / Weiter → oder Pfeiltasten
- **Übungsmodus**: Checkbox aktivieren → „✓ Geschafft"-Button pro Takt
- **Fortschrittsbalken**: Zeigt wie viele Takte bereits geübt wurden
- **Doigtés**: Optional ein-/ausschaltbar (Saite + Finger)
- **Keyboard**: ←/→ für Navigation, Enter zum Bestätigen
- **Playback**: Abspielen mit Geschwindigkeitsregler
- **Reset**: „Nochmal üben" nach Abschluss aller Takte
