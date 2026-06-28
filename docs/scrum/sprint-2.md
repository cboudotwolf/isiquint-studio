# Sprint 2 — Abgeschlossen (28.06.2026)

## Status: ✅ Fertig

## Ziele
- PDF-Export mit farbigen Notenlinien finalisieren
- LilyPond-Export vervollständigen
- UI Lesbarkeit verbessern (Kontraste, Schriftgrößen)
- Homepage und Repertoire-Seite redesignen
- isiQuint-Logo einbinden

## Erledigt

### PDF-Export
- Hybrider Ansatz: SVG-Erkennung (Staff-Linien Y-Positionen) + Canvas-Rendering + manuelle farbige Linien
- `svg2pdf.js` kann VexFlow-Musikfont-Glyphen nicht darstellen (Note-Köpfe leer) — verworfen
- Canvas Pixel-Scanning unzuverlässig (Noten/Barlines kreuzen Linien) — verworfen
- Endgültig: `pdf-export.ts` mit >500px Breiten-Filter für Staff-Linien-Erkennung

### LilyPond-Export
- Vollständiges `color-staff-lines` Scheme-Callback
- Korrekte Akzidentien-Mappe (`note.accidental[0]` ist FALSCH in VexFlow 5)

### UI / Design
- **Toolbar-Buttons** vergrößert (`text-lg`, `px-4 py-2`, `font-semibold`)
- **Note-Input-Buttons** unten vergrößert mit Tastatur-Kürzel-Badges (A/B/C/D/E/F/G)
- **Sidebar** (Tonart, Taktart, Tempo, Doigtés) vergrößert (`w-72`, `text-base`)
- **Header-Buttons** (Undo/Redo/Delete/.ly/PDF/Speichern) vergrößert
- **Alle Grau-Farben entfernt**: `isiq-text2` und `isiq-text3` durch `isiq-text` ersetzt (54 Vorkommen)
- **Titel** mit explizitem `text-isiq-text` für Tailwind 4 Kompatibilität

### Homepage (`/`)
- Navbar mit Logo + Links + CTA-Button
- Hero-Sektion mit SVG-Staff-Preview
- 3 Feature-Karten (Partituren erstellen, Sofort abspielen, PDF exportieren)
- Repertoire-Vorschau (6 Stücke)
- isiQuint-Methodik-Sektion mit Farblegende
- Footer mit Referenz zu Regine Bubeck

### Repertoire (`/repertoire`)
- Saison-Filter mit Emojis (🌸 ☀️ 🍂 ❄️ 🎵)
- Suchleiste mit Zähler
- Vergrößerte Karten mit Hover-Effekt
- Leerer-Zustand mit Reset-Button

### Logo
- `IsiQuintLogo`-Komponente (`src/components/ui/IsiQuintLogo.tsx`)
- Eingebunden auf: Homepage (Navbar + Hero), Repertoire, Dashboard, Login, Signup, Editor
- Datei: `public/isiquint-logo.png`

### Auth-Seiten
- Login (`/auth/login`) und Signup (`/auth/signup`) mit Supabase
- Logo + konsistentes Design

## Bekannte Einschränkungen
- VexFlow 5 SVG→Canvas konvertiert Custom-Fonts nicht (Note-Köpfe → leere Boxen)
- `note.accidental[0]` Mappe: sharp→"#", flat→"b", natural→"n"
- VexFlow 5 BarlineType: SINGLE=1, DOUBLE=2, END=3, REPEAT_BEGIN=4, REPEAT_END=5, REPEAT_BOTH=6, NONE=7

## Offene Punkte (Sprint 3)
- Editor E2E-Test mit echten Songs
- Copy/Paste Takte
- Drag-to-Reorder Takte
- Responsive Layout
- Supabase Integration testen (Auto-Save, CRUD)
