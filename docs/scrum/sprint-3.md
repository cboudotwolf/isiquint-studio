# Sprint 3 — Abgeschlossen (28.06.2026)

## Status: ✅ Fertig

## Ziele
- Editor-Erfahrung vervollständigen
- Takt-Management verbessern
- Responsive Layout für Tablet/Mobil
- Testing-Grundlage aufbauen

## Erledigt

### Editor — Takt-Management
- **Copy/Paste Takte** (Ctrl+C / Ctrl+V) — Takt in Zwischenablage kopieren und nach aktuellem Takt einfügen
- **Duplizieren** (Ctrl+D) — Aktuellen Takt direkt duplizieren
- **Drag-to-Reorder** — Takte per Drag & Drop in der Takt-Leiste neu anordnen (`@dnd-kit/core`, `@dnd-kit/sortable`)
- **Verschieben** — Pfeiltasten (Shift+←/→) zum Takt verschieben
- **UI-Buttons** — Kopieren, Einfügen, Duplizieren, ←, → in der Toolbar

### Editor — Keyboard Shortcuts
- Ctrl+Z → Undo
- Ctrl+Y / Ctrl+Shift+Z → Redo
- Ctrl+C → Takt kopieren
- Ctrl+V → Takt einfügen
- Ctrl+D → Takt duplizieren
- Shift+←/→ → Takt verschieben

### Responsive Layout
- **Sidebar** auf Desktop: `hidden md:block` (sichtbar ab md)
- **Sidebar** als Drawer auf Mobil: Sheet mit Overlay, geöffnet per ⚙-Button (fixed bottom-right)
- **SidebarContent** extrahiert als wiederverwendbare Komponente (geteilt zwischen Desktop und Mobile)

### Audio — PlaybackBar
- **Pause/Resume** — Play-Button wechselt zwischen ▶ und ⏸, Stop-Button (■) hält an
- **Position-Marker** — Aktuelle Note wird während Abspielen angezeigt ("Note 3/12")
- **onNotePlay** Callback — Editor kann auf Note-Events reagieren

### Testing
- **Vitest** + happy-dom Setup (`vitest.config.ts`, `tests/setup.ts`)
- **37 Unit-Tests** bestanden:
  - `isiquint-colors.test.ts` (7) — Farben-Array, hexToLilypondRgb
  - `fingerings.test.ts` (19) — getFingering, isFirstPosition
  - `lilypond-export.test.ts` (11) — LilyPond-Generierung

## Neue Dateien
- `src/components/editor/SortableMeasureButton.tsx` — DnD-fähiger Takt-Button
- `src/components/player/PlaybackBar.tsx` — Überarbeitet mit Pause/Resume + Position
- `vitest.config.ts` — Vitest-Konfiguration
- `tests/setup.ts` — Test-Setup
- `tests/isiquint-colors.test.ts`
- `tests/fingerings.test.ts`
- `tests/lilypond-export.test.ts`

## Offene Punkte (Sprint 4)
- Multi-User Kollaboration (Teilen von Partituren)
- Versionierung von Partituren (History)
- Noten-Import (MusicXML, MIDI)
