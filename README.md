# isiQuint Studio

**Browser-basierter Noten-Editor für Geigenlehrkräfte, basierend auf der isiQuint-Methode von Regine Bubeck-Cinus.**

isiQuint Studio ermöglicht es Geigenlehrkräften, Noten mit farbigen Notenlinien nach der isiQuint-Methode zu erstellen, zu bearbeiten und zu teilen — ein pädagogisches System, das Einsteigern hilft, Noten leichter zu lesen, indem jede Linie des Notensystems einer festen Farbe zugeordnet wird.

---

## Inhaltsverzeichnis

1. [Was ist die isiQuint-Methode?](#1-was-ist-die-isiquint-methode)
2. [Funktionen](#2-funktionen)
3. [Technische Architektur](#3-technische-architektur)
4. [Projektstruktur](#4-projektstruktur)
5. [Installation und Entwicklung](#5-installation-und-entwicklung)
6. [Deployment](#6-deployment)
7. [Benutzerhandbuch](#7-benutzerhandbuch)
8. [API und Integrationen](#8-api-und-integrationen)
9. [Tests](#9-tests)
10. [Roadmap](#10-roadmap)

---

## 1. Was ist die isiQuint-Methode?

Die isiQuint-Methode, entwickelt von Regine Bubeck-Cinus, verwendet feste Farben auf den Linien des Notensystems, um Einsteigern das Notenlesen zu erleichtern. Jede Linie hat immer die gleiche Farbe:

| Linie (oben → unten) | Farbe | Rolle |
|-----------------------|-------|-------|
| 1. Linie | 🟡 Gelb `#FFCC00` | Obere Linie |
| 2. Linie | ⬛ Schwarz `#000000` | |
| 3. Linie | 🔴 Rot `#FF0000` | Mittlere Linie (H) |
| 4. Linie | ⬛ Schwarz `#000000` | |
| 5. Linie | 🔵 Blau `#004DCC` | Untere Linie |

Diese Farben sind **immer gleich** — sie ändern sich nicht je nach Tonart oder Vorzeichen. Das System ist auf **Geige** beschränkt (Schlüssel, erste Lage, G3–B4).

---

## 2. Funktionen

### Noten-Editor
- Noteneingabe über **Tastatur** (A–G) oder **Klick** auf die Tastaturanzeige
- 5 Notenlängen: Ganz-, Halb-, Viertel-, Achtel-, Sechzehntelnote
- Vorzeichen: ♯ (Kreuz), ♭ (Beispiel), ♮ (Auflösungszeichen)
- Punktierung, Binder, Pausen
- Taktverwaltung: Hinzufügen, Löschen, Kopieren (Ctrl+C), Einfügen (Ctrl+V), Duplizieren (Ctrl+D), Umordnen per Drag & Drop
- Navigation: ←/→ für Takte, Shift+←/→ zum Verschieben

### Audio
- Playback mit **Tone.js**: Starten, Pausieren, Stoppen, Fortsetzen
- Tempo einstellbar (40–160 BPM)
- Positionsverfolgung während der Wiedergabe

### Import
| Format | Erweiterungen | Beschreibung |
|--------|---------------|--------------|
| MuseScore | `.mscz`, `.mscx` | ZIP mit MusicXML oder rohem XML |
| MusicXML | `.musicxml`, `.mxl` | Austauschformat |
| MIDI | `.mid`, `.midi` | MIDI-Standard |

### Export
| Format | Beschreibung |
|--------|-------------|
| **PDF** | Farbig oder Schwarz-weiß, A4-optimiert |
| **LilyPond** (.ly) | Für professionellen Notensatz, inkl. Farb-Callbacks |
| **MusicXML** (.xml) | Kompatibel mit MuseScore, Sibelius, Finale |
| **MuseScore** (.mscz) | ZIP, direkt in MuseScore öffnbar |

### Teilen
- Tokenisierte Freigabelinks mit Berechtigungen (Nur lesen / Lesen + Schreiben)
- Ablaufoptionen (1h, 24h, 7 Tage, 30 Tage, dauerhaft)
- **Übungsmodus**: Read-only-Ansicht für Schüler:innen mit Takt-für-Takt-Navigation, Fortschrittsbalken, Fingersätze

### Versionsverlauf
- Snapshots mit Beschriftung
- Wiederherstellung früherer Versionen

### Dashboard
- Liste der Kompositionen des Benutzers
- Suche nach Titel, Sortierung nach Datum/Titel/Tonart
- Schneller Zugang zum Editor

---

## 3. Technische Architektur

```
┌─────────────────────────────────────────────────┐
│                    Frontend                      │
│  Next.js 15 (App Router) · React 19 · Tailwind 4│
│  VexFlow 5 (SVG) · Tone.js (Audio)              │
├─────────────────────────────────────────────────┤
│                    Backend                       │
│  Supabase (PostgreSQL + Auth + REST API)         │
│  Self-hosted via Coolify auf Hetzner            │
├─────────────────────────────────────────────────┤
│                  Infrastruktur                   │
│  Docker · Coolify · Let's Encrypt               │
│  GitHub Actions (CI)                            │
└─────────────────────────────────────────────────┘
```

### Noten-Rendering
- **VexFlow 5** erzeugt die Noten als SVG
- Die Notenlinien werden im **Nachbearbeitungsprozess umgefärbt**: Regex auf SVG-`<path>`-Elementen, Erkennung über Länge (>500px) und Horizontalität, Gruppierung nach Y-Nähe, Anwendung der 5 Farben

### Datenspeicherung
- **Supabase**: PostgreSQL mit Row Level Security (RLS)
- Auto-Save alle 30 Sekunden (Debounce)
- 3 Tabellen: `scores`, `score_versions`, `share_links`

---

## 4. Projektstruktur

```
isiquint-studio/
├── src/
│   ├── app/                        # Next.js Seiten
│   │   ├── page.tsx                # Startseite
│   │   ├── editor/page.tsx         # Haupt-Editor (~1100 Zeilen)
│   │   ├── repertoire/page.tsx     # Katalog (20 Stücke)
│   │   ├── dashboard/page.tsx      # Dashboard
│   │   ├── practice/[token]/       # Übungsmodus (Schüler:innen)
│   │   ├── share/[token]/          # Read-only-Freigabe
│   │   └── auth/                   # Login / Registrierung
│   ├── components/
│   │   ├── editor/                 # ShareDialog, VersionHistory, ImportDialog, SortableMeasureButton
│   │   ├── export/                 # PdfExport (Dropdown BW/Farbe)
│   │   ├── practice/               # PracticeMode
│   │   ├── player/                 # PlaybackBar
│   │   ├── dashboard/              # DashboardClient
│   │   └── ui/                     # IsiQuintLogo
│   ├── lib/
│   │   ├── music/
│   │   │   ├── isiquint-colors.ts  # Feste Farben + LilyPond-Konvertierung
│   │   │   ├── pdf-export.ts       # Hybrid-Export SVG+Canvas
│   │   │   ├── lilypond-export.ts  # LilyPond-Export mit Farb-Callbacks
│   │   │   ├── musicxml-export.ts  # MusicXML-Export + .mscz via JSZip
│   │   │   ├── musicxml-import.ts  # Import MusicXML/MuseScore
│   │   │   ├── midi-import.ts      # Import Standard-MIDI
│   │   │   ├── share.ts            # CRUD für Freigabelinks
│   │   │   └── versions.ts         # Snapshots & Wiederherstellung
│   │   ├── data/
│   │   │   ├── songs.ts            # 20 echte Melodien
│   │   │   └── fingerings.ts       # Fingersatz-Tabelle (G3–B4)
│   │   └── supabase/               # Client, Server, Types
│   ├── hooks/                      # useAutoSave
│   └── types/music.ts              # TypeScript-Types
├── tests/                          # 60 Tests (Vitest)
├── docs/
│   ├── scrum/                      # Sprint-Dokumentation
│   └── guides/                     # Benutzerhandbuch
├── supabase/init.sql               # Datenbankschema
├── Dockerfile                      # Produktionsimage (standalone)
├── docker-compose.yml              # App + Supabase-Stack
└── .github/workflows/ci.yml       # CI: Tests + Build
```

---

## 5. Installation und Entwicklung

### Voraussetzungen
- Node.js 22+
- npm

### Einrichtung

```bash
git clone https://github.com/cboudotwolf/isiquint-studio.git
cd isiquint-studio
npm install
cp .env.local.example .env.local
```

`.env.local` konfigurieren:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:9999
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

### Entwicklung

```bash
npm run dev        # http://localhost:3000 (Turbopack)
npm run build      # Produktions-Build
npm run start      # Produktionsserver
npx vitest run     # Tests
npx tsc --noEmit   # TypeScript-Überprüfung
```

---

## 6. Deployment

### Docker (empfohlen)

```bash
# Build und Starten
docker compose up -d

# Oder mit erzwungenem Build
docker compose up -d --build
```

### Coolify

1. Eine **Docker Compose**-Ressource in Coolify anlegen
2. Das GitHub-Repo verbinden
3. Die `docker-compose.yml` erkennt automatisch App + Supabase
4. Umgebungsvariablen konfigurieren
5. Deployen

Siehe `docs/deployment.md` für die vollständige Anleitung.

---

## 7. Benutzerhandbuch

Das vollständige Handbuch findet sich in `docs/guides/editor-guide.md`. Die wichtigsten Abschnitte:

1. **Noteneingabe** — Tastatur oder Maus
2. **Taktverwaltung** — Hinzufügen, Löschen, Kopieren, Einfügen, Duplizieren, Umordnen
3. **Import/Export** — 5 Importformate, 4 Exportformate
4. **Teilen** — Tokenisierte Links mit Berechtigungen
5. **Übungsmodus** — Schüler-Ansicht mit Fortschritt
6. **Versionsverlauf** — Snapshots und Wiederherstellung
7. **Tastaturkürzel** — 14 Kürzel verfügbar

---

## 8. API und Integrationen

### Supabase

Die Anwendung kommuniziert mit Supabase über:
- **Client** (`@/lib/supabase/client`) — Browser-seitig
- **Server** (`@/lib/supabase/server`) — Server-seitig (SSR)

### Tabellen

| Tabelle | Beschreibung |
|---------|-------------|
| `scores` | Noten (JSONB für die Takte) |
| `score_versions` | Versionssnapshots |
| `share_links` | Tokenisierte Freigabelinks |

### Row Level Security

- Jeder Benutzer sieht nur seine eigenen Noten
- Freigabelinks sind über Token öffentlich zugänglich
- Versionen sind an die Eigentümerschaft der Noten gebunden

---

## 9. Tests

```bash
npx vitest run
```

| Datei | Tests | Abdeckung |
|-------|-------|-----------|
| `isiquint-colors.test.ts` | 7 | Farben, LilyPond-Konvertierung |
| `fingerings.test.ts` | 19 | Fingersätze erste Lage |
| `lilypond-export.test.ts` | 11 | LilyPond-Export |
| `musicxml-export.test.ts` | 13 | MusicXML-Export |
| `practice-mode.test.ts` | 10 | Übungsmodus, PDF BW, Teilen |
| **Gesamt** | **60** | |

---

## 10. Roadmap

### Erledigt ✅
- Sprints 1–5: Auth, Dashboard, Auto-Save, PDF/LilyPond/MusicXML/MuseScore-Export, Copy/Paste, Drag-to-Reorder, Responsive, Teilen, Versionierung, Import (MIDI/MusicXML/MuseScore), Übungsmodus, PDF Schwarz-weiß

### In Arbeit 🔄
- CI/CD GitHub Actions
- Deployment Coolify + Supabase Self-hosted

### Geplant 📋
- CI/CD-Pipeline mit E2E-Tests
- Monitoring & Alerting (Sentry)
- Backup-Strategie für Supabase
- REST-API für Drittanbieter-Integrationen
- Mobile App (React Native oder PWA)
- KI-gestützte Vorschläge
- Mehrsprachigkeit (DE, EN, FR)

---

## Danksagungen

- **isiQuint-Methode**: Regine Bubeck-Cinus
- **Stack**: Next.js, VexFlow, Tone.js, Supabase, Tailwind CSS
- **Hosting**: Hetzner CX22 via Coolify

## Lizenz

Privates Projekt — cboudotwolf
