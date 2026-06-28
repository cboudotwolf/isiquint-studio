"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import IsiQuintLogo from "@/components/ui/IsiQuintLogo";
import { createClient } from "@/lib/supabase/client";

interface ScoreRow {
  id: string;
  title: string;
  key_signature: string;
  tempo: number;
  updated_at: string;
}

type SortKey = "updated_at" | "title" | "key_signature";

export default function DashboardClient({ initialScores, userName }: { initialScores: ScoreRow[]; userName: string }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("updated_at");
  const [sortAsc, setSortAsc] = useState(false);
  const router = useRouter();

  const filtered = useMemo(() => {
    let result = initialScores;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.key_signature.toLowerCase().includes(q)
      );
    }

    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "title") cmp = a.title.localeCompare(b.title);
      else if (sortKey === "key_signature") cmp = a.key_signature.localeCompare(b.key_signature);
      else cmp = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      return sortAsc ? cmp : -cmp;
    });

    return result;
  }, [initialScores, search, sortKey, sortAsc]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === "title");
    }
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-isiq-bg">
      <nav className="flex items-center justify-between px-8 py-4 border-b border-isiq-border bg-isiq-surface sticky top-0 z-10">
        <Link href="/">
          <IsiQuintLogo height={36} />
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-isiq-text hover:text-isiq-accent transition-colors">
            Start
          </Link>
          <Link href="/repertoire" className="text-sm font-medium text-isiq-text hover:text-isiq-accent transition-colors">
            Repertoire
          </Link>
          <Link href="/dashboard" className="text-sm font-semibold text-isiq-accent border-b-2 border-isiq-accent pb-0.5">
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

      <main className="max-w-5xl mx-auto px-6 py-8" id="main-content">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-isiq-text mb-1">
            Willkommen, {userName}
          </h1>
          <p className="text-isiq-text">
            {initialScores.length} Partitur{initialScores.length !== 1 ? "en" : ""} gespeichert
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-xs">
            <input
              type="text"
              placeholder="Suche nach Titel oder Tonart..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-isiq-border rounded-lg bg-white text-base focus:outline-none focus:ring-2 focus:ring-isiq-accent focus:border-isiq-accent"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-isiq-text">🔍</span>
          </div>
          <div className="flex gap-2">
            {([
              { key: "updated_at" as SortKey, label: "Datum" },
              { key: "title" as SortKey, label: "Titel" },
              { key: "key_signature" as SortKey, label: "Tonart" },
            ]).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => toggleSort(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  sortKey === key
                    ? "bg-isiq-accent text-white border-isiq-accent"
                    : "bg-white border-isiq-border text-isiq-text hover:border-isiq-accent"
                }`}
              >
                {label} {sortKey === key ? (sortAsc ? "↑" : "↓") : ""}
              </button>
            ))}
          </div>
          <Link
            href="/editor"
            className="px-5 py-2 bg-isiq-accent text-white rounded-lg font-medium hover:bg-[#A93226] transition-colors text-sm text-center"
          >
            + Neue Partitur
          </Link>
        </div>

        {filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((score) => (
              <Link
                key={score.id}
                href={`/editor?score=${score.id}`}
                className="bg-isiq-surface border border-isiq-border rounded-xl p-5 hover:shadow-md hover:border-isiq-accent/30 transition-all group"
              >
                <h3 className="font-semibold text-isiq-text group-hover:text-isiq-accent transition-colors">
                  {score.title}
                </h3>
                <p className="text-sm text-isiq-text mt-1">
                  {score.key_signature} · {score.tempo} BPM
                </p>
                <p className="text-xs text-isiq-text mt-1">
                  {new Date(score.updated_at).toLocaleDateString("de-DE")}
                </p>
              </Link>
            ))}
          </div>
        ) : initialScores.length === 0 ? (
          <div className="text-center py-16 bg-isiq-surface border border-isiq-border rounded-xl">
            <p className="text-isiq-text mb-4">
              Noch keine Partituren gespeichert.
            </p>
            <Link
              href="/editor"
              className="inline-block bg-isiq-accent text-white px-6 py-2 rounded-lg font-medium hover:bg-[#A93226] transition-colors"
            >
              Erste Partitur erstellen
            </Link>
          </div>
        ) : (
          <p className="text-center text-isiq-text py-12">
            Keine Partituren gefunden.
          </p>
        )}

        <div className="mt-8 pt-6 border-t border-isiq-border">
          <button
            onClick={handleSignOut}
            className="text-sm text-isiq-text hover:text-isiq-accent"
          >
            Abmelden
          </button>
        </div>
      </main>
    </div>
  );
}
