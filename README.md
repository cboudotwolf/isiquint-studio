# isiQuint Studio

Farbige Notenlinien für Geigenanfänger — Web-App für Lehrkräfte.

Basierend auf der isiQuint-Methode von Regine Bubeck-Cinus.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **UI**: Tailwind CSS 4
- **Musik**: VexFlow 5 (Noten-Rendering), Tone.js (Audio-Playback)
- **Auth/DB**: Supabase (self-hosted via Coolify)
- **Export**: PDF, LilyPond (.ly), MusicXML (.xml), MuseScore (.mscz)
- **Import**: MuseScore (.mscz/.mscx), MusicXML (.musicxml/.mxl), MIDI (.mid)

## Entwicklung

```bash
npm install
cp .env.local.example .env.local
# .env.local mit Supabase-URL und Key füllen
npm run dev
```

## Deployment

- **Coolify** auf einer Hetzner CX22 VM
- Supabase Self-Hosted als Coolify Service
- Next.js als Coolify Resource (Docker)

## Struktur

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Landing
│   ├── editor/page.tsx     # Partitur-Editor
│   ├── repertoire/page.tsx # Katalog (20 Stücke)
│   ├── dashboard/page.tsx  # Lehrer-Dashboard
│   └── auth/               # Login/Signup
├── components/
│   ├── staff/              # ColoredStaff (VexFlow)
│   ├── editor/             # Editor-Komponenten
│   ├── player/             # Tone.js Player
│   ├── export/             # PDF/LilyPond Export
│   └── ui/                 # IsiQuintLogo etc.
├── lib/
│   ├── music/              # Farben, VexFlow, MIDI, MusicXML, MuseScore, Share, Versions
│   ├── data/               # Songs, Fingering-Tabellen
│   └── supabase/           # Client, Server, Types
├── hooks/                  # Custom React Hooks (useAutoSave)
└── types/                  # TypeScript Types
```

## Status

- Sprint 1: Auth, Dashboard, Auto-Save ✅
- Sprint 2: PDF-Export, LilyPond, UI-Redesign, Logo ✅
- Sprint 3: Copy/Paste, Drag-to-Reorder, Responsive, Playback, Tests ✅
- Sprint 4: Sharing, Versioning, MuseScore/MusicXML/MIDI-Import/Export, Dashboard ✅
# isiquint-studio
