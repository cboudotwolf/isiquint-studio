"use client";

import { downloadLilypond } from "@/lib/music/lilypond-export";
import type { Score } from "@/types/music";

interface LilypondExportProps {
  score: Score;
}

export default function LilypondExport({ score }: LilypondExportProps) {
  return (
    <button
      onClick={() => downloadLilypond(score)}
      className="px-3 py-1.5 text-sm border border-isiq-border rounded hover:bg-isiq-surface text-isiq-text transition-colors"
      title="LilyPond-Datei herunterladen"
    >
      .ly
    </button>
  );
}
