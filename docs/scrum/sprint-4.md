# Sprint 4 — Abgeschlossen (28.06.2026)

## Status: ✅ Fertig

## Ziele
- Partituren teilen und zusammenarbeiten
- Versionsverwaltung für Partituren
- Noten-Import/Export (MuseScore, MusicXML, MIDI)
- Dashboard verbessern

## Erledigt

### Collaboration — Partitur teilen
- **ShareDialog** (`src/components/editor/ShareDialog.tsx`) — Token-basiertes Teilen mit Berechtigungswahl
- **Berechtigungen**: Nur lesen (R) vs. Lesen + Schreiben (R/W)
- **Ablaufzeit**: Nie ablaufend, 1h, 24h, 7 Tage, 30 Tage
- **Vorhandene Links** anzeigen und widerrufen
- **Share-Seite** (`/share/[token]`) — Server-seitige Token-Validierung
  - Lesen: Zeigt Info-Seite
  - Schreiben: Redirect zum Editor
  - Abgelaufen/ungültig: Fehlerseite

### Versionierung
- **saveVersion / getVersions / getVersion** (`src/lib/music/versions.ts`) — Supabase-basierte Versionsspeicherung
- **VersionHistory** (`src/components/editor/VersionHistory.tsx`) — Dialog mit Versionsverlauf
  - Snapshot mit optionalem Label speichern
  - Alle Versionen chronologisch anzeigen
  - Ein-Klick-Wiederherstellung

### Import — MuseScore & MusicXML
- **MusicXML-Parser** (`src/lib/music/musicxml-import.ts`) — DOMParser-basiert
  - Pitch → NoteName + Oktave + Vorzeichen (step/alter/octave)
  - Key Signature aus fifths (C-Dur=0, G-Dur=1, etc.)
  - Tempo aus `<sound tempo="..."/>`
  - Automatische Takt-Aufteilung
- **MuseScore-Support** (`.mscz`) — JSZip zum Entpacken von .mscx aus Archive
- **MXL-Support** (`.mxl`) — ZIP-Format mit MusicXML-Datei
- **MIDI-Import** (`src/lib/music/midi-import.ts`) — Standard-MIDI-Dateien
  - MThd-Header, MTrk-Events (Note On/Off)
  - MIDI → NoteName-Konvertierung, Ticks → Beats
- **ImportDialog** (`src/components/editor/ImportDialog.tsx`) — Drag & Drop
  - Formate: .mscz, .mscx, .musicxml, .mxl, .xml, .mid, .midi

### Export — MuseScore & MusicXML
- **MusicXML-Generator** (`src/lib/music/musicxml-export.ts`)
  - Score → MusicXML Partwise (note, rest, accidental, dotted)
  - Key/Time/Clef/Tempo korrekt ausgegeben
- **MuseScore-Export** (.mscz) — ZIP mit MusicXML + META-INF + score_style.mss
- **3 Export-Buttons** in der Toolbar: `.ly` | `.xml` | `.mscz` | `PDF`

### Dashboard
- **DashboardClient** (`src/components/dashboard/DashboardClient.tsx`) — Client-seitiges Dashboard
- **Suchfilter**: Suche nach Titel oder Tonart
- **Sortierung**: Datum, Titel, Tonart (auf/absteigend)
- **Konsistentes Design**: Navbar wie Homepage + Repertoire

## Neue Dateien
- `src/lib/music/share.ts` — ShareLink-Funktionen (create, revoke, get, resolve)
- `src/lib/music/versions.ts` — Versionierungs-Funktionen (save, get)
- `src/lib/music/midi-import.ts` — MIDI-Parser
- `src/lib/music/musicxml-import.ts` — MusicXML/MuseScore-Parser
- `src/lib/music/musicxml-export.ts` — MusicXML-Generator + MuseScore-Export
- `src/components/editor/ShareDialog.tsx` — Share-UI
- `src/components/editor/VersionHistory.tsx` — Versionsverlauf-UI
- `src/components/editor/ImportDialog.tsx` — Import-UI (erweitert)
- `src/components/dashboard/DashboardClient.tsx` — Dashboard-Client
- `src/app/share/[token]/page.tsx` — Share-Token-Resolver

## Bekannte Einschränkungen
- LilyPond-Import noch nicht implementiert
- Keine Echtzeit-Kollaboration (nur geteilte Links)
- MuseScore-Export erzeugt minimales .mscz (keine Layout-Informationen)

## Offene Punkte (Sprint 5)
- Schüler:innen-Modus (einfache Ansicht ohne Bearbeitung)
- Notendruck-optimiertes PDF (A4, schwarz-weiß option)
- API für externe Integration
