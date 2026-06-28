import Link from "next/link";
import { SONGS } from "@/lib/data/songs";
import IsiQuintLogo from "@/components/ui/IsiQuintLogo";

export default function HomePage() {
  const featuredSongs = SONGS.slice(0, 6);

  return (
    <div className="min-h-screen bg-isiq-bg">
      <nav className="flex items-center justify-between px-8 py-4 border-b border-isiq-border bg-isiq-surface sticky top-0 z-10">
        <Link href="/">
          <IsiQuintLogo height={36} />
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/repertoire" className="text-sm font-medium text-isiq-text hover:text-isiq-text transition-colors">
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

      <main>
        <section className="relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
                  <IsiQuintLogo height={72} />
                </h1>
                <p className="text-xl text-isiq-text mb-4 leading-relaxed">
                  Farbige Notenlinien für den Einstieg ins Geigenspiel.
                </p>
                <p className="text-base text-isiq-text mb-8 max-w-md">
                  Erstelle Partituren mit der isiQuint-Methode — 3 farbige Linien (gelb, rot, blau) helfen Kindern, Noten auf dem Violinbogen zuordnen.
                </p>
                <div className="flex gap-3">
                  <Link
                    href="/editor"
                    className="inline-block bg-isiq-accent text-white px-8 py-3.5 rounded-lg font-semibold text-lg hover:bg-[#A93226] transition-colors"
                  >
                    Jetzt starten
                  </Link>
                  <Link
                    href="/repertoire"
                    className="inline-block border-2 border-isiq-border text-isiq-text px-8 py-3.5 rounded-lg font-semibold text-lg hover:border-isiq-accent hover:text-isiq-accent transition-colors"
                  >
                    Repertoire ansehen
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="bg-white border border-isiq-border rounded-2xl shadow-xl p-8">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-isiq-accent" />
                    <div className="w-3 h-3 rounded-full bg-orange-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    <span className="ml-2 text-xs text-isiq-text font-mono">Neue Partitur</span>
                  </div>
                  <svg viewBox="0 0 600 120" className="w-full">
                    <line x1="0" y1="10" x2="600" y2="10" stroke="#FFCC00" strokeWidth="1.5" />
                    <line x1="0" y1="30" x2="600" y2="30" stroke="#000000" strokeWidth="1.5" />
                    <line x1="0" y1="50" x2="600" y2="50" stroke="#FF0000" strokeWidth="1.5" />
                    <line x1="0" y1="70" x2="600" y2="70" stroke="#000000" strokeWidth="1.5" />
                    <line x1="0" y1="90" x2="600" y2="90" stroke="#004DCC" strokeWidth="1.5" />
                    <circle cx="120" cy="50" r="5" fill="#1A1A1A" />
                    <line x1="125" y1="50" x2="125" y2="20" stroke="#1A1A1A" strokeWidth="1.5" />
                    <circle cx="220" cy="70" r="5" fill="#1A1A1A" />
                    <line x1="225" y1="70" x2="225" y2="30" stroke="#1A1A1A" strokeWidth="1.5" />
                    <circle cx="320" cy="30" r="5" fill="#1A1A1A" />
                    <line x1="325" y1="30" x2="325" y2="60" stroke="#1A1A1A" strokeWidth="1.5" />
                    <circle cx="420" cy="10" r="5" fill="#1A1A1A" />
                    <line x1="425" y1="10" x2="425" y2="50" stroke="#1A1A1A" strokeWidth="1.5" />
                    <circle cx="520" cy="90" r="5" fill="#1A1A1A" />
                    <line x1="525" y1="90" x2="525" y2="50" stroke="#1A1A1A" strokeWidth="1.5" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-isiq-border bg-isiq-surface py-16">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: "✎",
                  title: "Partituren erstellen",
                  desc: "Noten per Klick oder Tastatur auf die farbige Notenzeile setzen. Doigtés werden automatisch angezeigt.",
                },
                {
                  icon: "▶",
                  title: "Sofort abspielen",
                  desc: "Höre dir deine Partitur an — mit realistischem Violin-Sound via Tone.js-Synthesizer.",
                },
                {
                  icon: "↓",
                  title: "PDF exportieren",
                  desc: "Exportiere deine Partitur als farbiges PDF oder LilyPond-Datei für professionellen Notensatz.",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="text-center p-8 rounded-xl border border-isiq-border bg-isiq-bg hover:shadow-md transition-shadow"
                >
                  <div className="text-3xl mb-4 text-isiq-text">{feature.icon}</div>
                  <h3 className="text-lg font-semibold mb-2 text-isiq-text">{feature.title}</h3>
                  <p className="text-isiq-text text-sm leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-5xl mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-semibold text-isiq-text">Repertoire</h2>
              <Link
                href="/repertoire"
                className="text-isiq-accent text-sm font-semibold hover:underline"
              >
                Alle 20 Stücke →
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredSongs.map((song) => (
                <Link
                  key={song.nr}
                  href="/repertoire"
                  className="bg-isiq-surface border border-isiq-border rounded-xl p-5 hover:shadow-md hover:border-isiq-accent/30 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs text-isiq-text font-medium">
                        Nr. {song.nr}
                      </span>
                      <h3 className="font-semibold mt-1 text-isiq-text group-hover:text-isiq-accent transition-colors">{song.name}</h3>
                    </div>
                    <SeasonBadge season={song.season} />
                  </div>
                  <div className="mt-3 text-xs text-isiq-text">
                    {song.key} · {song.timeSignature[0]}/{song.timeSignature[1]}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-isiq-border bg-isiq-surface py-16">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-2xl font-semibold mb-4 text-isiq-text">Über die isiQuint-Methode</h2>
            <p className="text-isiq-text leading-relaxed">
              Die isiQuint-Methode wurde von{" "}
              <a
                href="https://www.reginebubeck.de/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-isiq-accent font-medium hover:underline"
              >
                Regine Bubeck
              </a>{" "}
              entwickelt.
              Durch 3 farbige Linien auf der Violinnotenzeile — gelb (E-Saite), rot (A-Saite) und blau (D-Saite) —
              können Kinder Noten schnell und intuitiv zuordnen.
              Die schwarzen Linien bleiben als Referenz.
            </p>
            <div className="flex justify-center gap-8 mt-8">
              {[
                { color: "#FFCC00", label: "E-Saite", line: "Obere Linie" },
                { color: "#FF0000", label: "A-Saite", line: "Mittlere Linie" },
                { color: "#004DCC", label: "D-Saite", line: "Untere Linie" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <div className="w-10 h-1 rounded-full" style={{ backgroundColor: s.color }} />
                  <div className="text-left">
                    <div className="text-sm font-semibold text-isiq-text">{s.label}</div>
                    <div className="text-xs text-isiq-text">{s.line}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="text-center py-8 text-sm text-isiq-text border-t border-isiq-border">
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
    Frühling: "bg-green-100 text-green-700",
    Sommer: "bg-yellow-100 text-yellow-700",
    Herbst: "bg-orange-100 text-orange-700",
    Winter: "bg-blue-100 text-blue-700",
    Ganzjährig: "bg-gray-100 text-gray-700",
  };

  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${colorMap[season] ?? "bg-gray-100 text-gray-700"}`}
    >
      {season}
    </span>
  );
}
