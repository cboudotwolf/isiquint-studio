"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { SONGS } from "@/lib/data/songs";
import IsiQuintLogo from "@/components/ui/IsiQuintLogo";

const SEASONS = [
  "Alle",
  "Frühling",
  "Sommer",
  "Herbst",
  "Winter",
  "Ganzjährig",
] as const;

const SEASON_ICONS: Record<string, string> = {
  Frühling: "🌸",
  Sommer: "☀️",
  Herbst: "🍂",
  Winter: "❄️",
  Ganzjährig: "🎵",
};

type SeasonFilter = (typeof SEASONS)[number];

export default function RepertoirePage() {
  const [seasonFilter, setSeasonFilter] = useState<SeasonFilter>("Alle");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return SONGS.filter((song) => {
      const matchSeason =
        seasonFilter === "Alle" || song.season === seasonFilter;
      const matchSearch =
        !search ||
        song.name.toLowerCase().includes(search.toLowerCase());
      return matchSeason && matchSearch;
    });
  }, [seasonFilter, search]);

  return (
    <div className="min-h-screen bg-isiq-bg">
      <nav className="flex items-center justify-between px-8 py-4 border-b border-isiq-border bg-isiq-surface sticky top-0 z-10">
        <Link href="/">
          <IsiQuintLogo height={36} />
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-isiq-text hover:text-isiq-text transition-colors">
            Start
          </Link>
          <Link href="/repertoire" className="text-sm font-semibold text-isiq-accent border-b-2 border-isiq-accent pb-0.5">
            Repertoire
          </Link>
          <Link href="/dashboard" className="text-sm font-medium text-isiq-text hover:text-isiq-text transition-colors">
            Dashboard
          </Link>
          <Link
            href="/editor"
            className="px-5 py-2 text-sm font-semibold bg-isiq-accent text-white rounded-lg hover:bg-[#A93226] transition-colors"
          >
            Editor öffnen
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10" id="main-content">
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-2 text-isiq-text">Repertoire</h1>
          <p className="text-lg text-isiq-text">
            20 Stücke aus „Mit der Geige durch das Jahr"
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {SEASONS.map((season) => (
              <button
                key={season}
                onClick={() => setSeasonFilter(season)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                  seasonFilter === season
                    ? "bg-isiq-accent text-white shadow-sm"
                    : "bg-white border border-isiq-border text-isiq-text hover:border-isiq-accent hover:text-isiq-accent"
                }`}
              >
                {season !== "Alle" && SEASON_ICONS[season] + " "}
                {season}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-xs">
            <input
              type="text"
              placeholder="Stück suchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-isiq-border rounded-lg bg-white text-base focus:outline-none focus:ring-2 focus:ring-isiq-accent focus:border-isiq-accent"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-isiq-text">🔍</span>
          </div>
        </div>

        <div className="text-sm text-isiq-text mb-4">
          {filtered.length} Stück{filtered.length !== 1 ? "e" : ""}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((song) => (
            <Link
              key={song.nr}
              href={`/editor?song=${song.nr}`}
              className="bg-white border border-isiq-border rounded-xl p-6 hover:shadow-lg hover:border-isiq-accent/30 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-xs font-semibold text-isiq-accent">
                    Nr. {song.nr}
                  </span>
                  <h3 className="text-lg font-semibold mt-1 text-isiq-text group-hover:text-isiq-accent transition-colors">
                    {song.name}
                  </h3>
                </div>
                <SeasonBadge season={song.season} />
              </div>
              <div className="flex items-center gap-3 text-sm text-isiq-text">
                <span>{song.key}</span>
                <span>·</span>
                <span>{song.timeSignature[0]}/{song.timeSignature[1]}</span>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-lg text-isiq-text">
              Keine Stücke gefunden.
            </p>
            <button
              onClick={() => { setSeasonFilter("Alle"); setSearch(""); }}
              className="mt-4 text-isiq-accent text-sm font-semibold hover:underline"
            >
              Filter zurücksetzen
            </button>
          </div>
        )}
      </main>

      <footer className="text-center py-8 text-sm text-isiq-text border-t border-isiq-border mt-16">
        <p>isiQuint · isiquint.app</p>
        <p className="mt-1">
          Basierend auf der{" "}
          <a
            href="https://www.reginebubeck.de/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-isiq-accent transition-colors"
          >
            isiQuint-Methode von Regine Bubeck
          </a>
        </p>
      </footer>
    </div>
  );
}

function SeasonBadge({ season }: { season: string }) {
  const colorMap: Record<string, string> = {
    Frühling: "bg-green-100 text-green-700 border-green-200",
    Sommer: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Herbst: "bg-orange-100 text-orange-700 border-orange-200",
    Winter: "bg-blue-100 text-blue-700 border-blue-200",
    Ganzjährig: "bg-gray-100 text-gray-700 border-gray-200",
  };

  return (
    <span
      className={`text-xs px-3 py-1 rounded-full font-semibold border whitespace-nowrap ${colorMap[season] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}
    >
      {SEASON_ICONS[season] ?? ""} {season}
    </span>
  );
}
