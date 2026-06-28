# isiQuint Studio

**Application web de notation musicale pour Geigenlehrkräfte, basée sur la méthode isiQuint de Regine Bubeck-Cinus.**

isiQuint Studio permet aux professeurs de violon de créer, éditer et partager des partitions avec des portées colorées selon la méthode isiQuint — un système pédagogique qui aide les débutants à mieux lire la musique en associant chaque ligne de la portée à une couleur fixe.

---

## Table des matières

1. [Qu'est-ce que la méthode isiQuint ?](#1-quest-ce-que-la-méthode-isiquint)
2. [Fonctionnalités](#2-fonctionnalités)
3. [Architecture technique](#3-architecture-technique)
4. [Structure du projet](#4-structure-du-projet)
5. [Installation et développement](#5-installation-et-développement)
6. [Deployment](#6-déploiement)
7. [Guide utilisateur](#7-guide-utilisateur)
8. [API et intégrations](#8-api-et-intégrations)
9. [Tests](#9-tests)
10. [Roadmap](#10-roadmap)

---

## 1. Qu'est-ce que la méthode isiQuint ?

La méthode isiQuint, développée par Regine Bubeck-Cinus, utilise des couleurs fixes sur les lignes de la portée pour aider les débutants à identifier plus facilement les notes. Chaque ligne a toujours la même couleur :

| Ligne (haut → bas) | Couleur | Rôle |
|---------------------|---------|------|
| 1ᵉʳ ligne | 🟡 Jaune `#FFCC00` | Ligne supérieure |
| 2ᵉᵐᵉ ligne | ⬛ Noir `#000000` | |
| 3ᵉᵐᵉ ligne | 🔴 Rouge `#FF0000` | Ligne centrale (Si/Ti) |
| 4ᵉᵐᵉ ligne | ⬛ Noir `#000000` | |
| 5ᵉᵐᵉ ligne | 🔵 Bleu `#004DCC` | Ligne inférieure |

Ces couleurs sont **toujours les mêmes** — elles ne changent pas selon la clé ou la tonalité. Le système est limité au **violon** (clé de sol, première position, G3–B4).

---

## 2. Fonctionnalités

### Éditeur de partitions
- Saisie de notes par **clavier** (A–G) ou par **clic** sur le clavier virtuel
- 5 durées : ronde, blanche, noire, croche, double-croche
- Vorzeichen : ♯ (ké), ♭ (bémol), ♮ (bécarre)
- Punktierung, liaisons, pauses
- Gestion des mesures : ajouter, supprimer, copier (Ctrl+C), coller (Ctrl+V), dupliquer (Ctrl+D), réordonner par drag & drop
- Navigation : ←/→ pour les mesures, Shift+←/→ pour déplacer

### Audio
- Playback avec **Tone.js** : play, pause, stop, reprendre
- Tempo réglable (40–160 BPM)
- Suivi de position pendant la lecture

### Import
| Format | Extensions | Description |
|--------|-----------|-------------|
| MuseScore | `.mscz`, `.mscx` | ZIP MusicXML ou XML brut |
| MusicXML | `.musicxml`, `.mxl` | Standard d'échange |
| MIDI | `.mid`, `.midi` | Standard MIDI |

### Export
| Format | Description |
|--------|-------------|
| **PDF** | Farbig ou Schwarz-weiß, A4 optimisé |
| **LilyPond** (.ly) | Pour notation professionnelle, inclut les callbacks couleur |
| **MusicXML** (.xml) | Compatible MuseScore, Sibelius, Finale |
| **MuseScore** (.mscz) | ZIP prêt pour MuseScore |

### Partage
- Liens de partage tokenisés avec permissions (lecture seule / lecture-écriture)
- Options d'expiration (1h, 24h, 7j, 30j, permanent)
- **Mode practice** : Vue read-only pour élèves avec navigation takt-für-takt, barre de progression, doigtés

### Versionnage
- Snapshots de sauvegarde avec labels
- Restauration de versions précédentes

### Dashboard
- Liste des compositions de l'utilisateur
- Recherche par titre, tri par date/titre/tonalité
- Accès rapide à l'éditeur

---

## 3. Architecture technique

```
┌─────────────────────────────────────────────────┐
│                    Frontend                      │
│  Next.js 15 (App Router) · React 19 · Tailwind 4│
│  VexFlow 5 (SVG) · Tone.js (Audio)              │
├─────────────────────────────────────────────────┤
│                    Backend                       │
│  Supabase (PostgreSQL + Auth + REST API)         │
│  Auto-hébergé via Coolify sur Hetzner           │
├─────────────────────────────────────────────────┤
│                  Infrastructure                  │
│  Docker · Coolify · Let's Encrypt               │
│  GitHub Actions (CI)                            │
└─────────────────────────────────────────────────┘
```

### Rendu musical
- **VexFlow 5** génère la notation en SVG
- Les lignes de portée sont **recolorisées en post-traitement** : regex sur les `<path>` SVG, détection par longueur (>500px) et horizontalité, regroupement par Y-proximité, application des 5 couleurs

### Persistance
- **Supabase** : PostgreSQL avec Row Level Security (RLS)
- Auto-save toutes les 30 secondes (debounce)
- 3 tables : `scores`, `score_versions`, `share_links`

---

## 4. Structure du projet

```
isiquint-studio/
├── src/
│   ├── app/                        # Pages Next.js
│   │   ├── page.tsx                # Landing page
│   │   ├── editor/page.tsx         # Éditeur principal (~1100 lignes)
│   │   ├── repertoire/page.tsx     # Catalogue de 20 morceaux
│   │   ├── dashboard/page.tsx      # Tableau de bord
│   │   ├── practice/[token]/       # Mode pratique (élèves)
│   │   ├── share/[token]/          # Partage read-only
│   │   └── auth/                   # Login / Signup
│   ├── components/
│   │   ├── editor/                 # ShareDialog, VersionHistory, ImportDialog, SortableMeasureButton
│   │   ├── export/                 # PdfExport (dropdown BW/couleur)
│   │   ├── practice/               # PracticeMode
│   │   ├── player/                 # PlaybackBar
│   │   ├── dashboard/              # DashboardClient
│   │   └── ui/                     # IsiQuintLogo
│   ├── lib/
│   │   ├── music/
│   │   │   ├── isiquint-colors.ts  # Couleurs fixes + conversion LilyPond
│   │   │   ├── pdf-export.ts       # Export PDF hybride SVG+Canvas
│   │   │   ├── lilypond-export.ts  # Export LilyPond avec callback couleur
│   │   │   ├── musicxml-export.ts  # Export MusicXML + .mscz via JSZip
│   │   │   ├── musicxml-import.ts  # Import MusicXML/MuseScore
│   │   │   ├── midi-import.ts      # Import Standard MIDI
│   │   │   ├── share.ts            # CRUD liens de partage
│   │   │   └── versions.ts         # Snapshots & restauration
│   │   ├── data/
│   │   │   ├── songs.ts            # 20 morceaux réels
│   │   │   └── fingerings.ts       # Tableau de doigtés (G3–B4)
│   │   └── supabase/               # Client, Server, Types
│   ├── hooks/                      # useAutoSave
│   └── types/music.ts              # Types TypeScript
├── tests/                          # 60 tests Vitest
├── docs/
│   ├── scrum/                      # Documentation sprints
│   └── guides/                     # Guide utilisateur
├── supabase/init.sql               # Schéma de base
├── Dockerfile                      # Image production (standalone)
├── docker-compose.yml              # App + Supabase stack
└── .github/workflows/ci.yml       # CI: tests + build
```

---

## 5. Installation et développement

### Prérequis
- Node.js 22+
- npm

### Setup

```bash
git clone https://github.com/cboudotwolf/isiquint-studio.git
cd isiquint-studio
npm install
cp .env.local.example .env.local
```

Configurer `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:9999
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

### Développement

```bash
npm run dev        # http://localhost:3000 (Turbopack)
npm run build      # Build production
npm run start      # Serveur production
npx vitest run     # Tests
npx tsc --noEmit   # Vérification TypeScript
```

---

## 6. Déploiement

### Docker (recommandé)

```bash
# Build et lancer
docker compose up -d

# Ou avec build forcé
docker compose up -d --build
```

### Coolify

1. Créer une ressource **Docker Compose** dans Coolify
2. Connecter le repo GitHub
3. Le `docker-compose.yml` détecte automatiquement l'app + Supabase
4. Configurer les variables d'environnement
5. Déployer

Voir `docs/deployment.md` pour le guide complet.

---

## 7. Guide utilisateur

Le guide complet se trouve dans `docs/guides/editor-guide.md`. Sections principales :

1. **Saisie de notes** — clavier ou souris
2. **Gestion des mesures** — ajouter, supprimer, copier, coller, dupliquer, réordonner
3. **Import/Export** — 5 formats import, 4 formats export
4. **Partage** — liens tokenisés avec permissions
5. **Mode practice** — vue élèves avec progression
6. **Versionnage** — snapshots et restauration
7. **Raccourcis clavier** — 14 raccourcis disponibles

---

## 8. API et intégrations

### Supabase

L'application communique avec Supabase via :
- **Client** (`@/lib/supabase/client`) — côté navigateur
- **Server** (`@/lib/supabase/server`) — côté serveur (SSR)

### Tables

| Table | Description |
|-------|-------------|
| `scores` | Partiturs (JSONB pour les mesures) |
| `score_versions` | Snapshots de versions |
| `share_links` | Liens de partage tokenisés |

### Row Level Security

- Chaque utilisateur ne voit que ses propres partiturs
- Les liens de partage sont accessibles publiquement par token
- Les versions sont liées à la propriété de la partiture

---

## 9. Tests

```bash
npx vitest run
```

| Fichier | Tests | Couverture |
|---------|-------|------------|
| `isiquint-colors.test.ts` | 7 | Couleurs, conversion LilyPond |
| `fingerings.test.ts` | 19 | Doigtés première position |
| `lilypond-export.test.ts` | 11 | Export LilyPond |
| `musicxml-export.test.ts` | 13 | Export MusicXML |
| `practice-mode.test.ts` | 10 | Mode practice, PDF BW, partage |
| **Total** | **60** | |

---

## 10. Roadmap

### Fait ✅
- Sprints 1–5 : Auth, Dashboard, Auto-Save, PDF/LilyPond/MusicXML/MuseScore Export, Copy/Paste, Drag-to-Reorder, Responsive, Sharing, Versioning, Import (MIDI/MusicXML/MuseScore), Mode Practice, PDF Schwarz-weiß

### En cours 🔄
- CI/CD GitHub Actions
- Déploiement Coolify + Supabase auto-hébergé

### À venir 📋
- CI/CD pipeline complet avec E2E tests
- Monitoring & Alerting (Sentry)
- Backup-Strategie Supabase
- API REST pour intégrations tierces
- Mobil-App (React Native ou PWA)
- KI-gestützte Vorschläge
- Mehrsprachigkeit (DE, EN, FR)

---

## Crédits

- **Méthode isiQuint** : Regine Bubeck-Cinus
- **Stack** : Next.js, VexFlow, Tone.js, Supabase, Tailwind CSS
- **Hébergement** : Hetzner CX22 via Coolify

## Licence

Projet privé — cboudotwolf
