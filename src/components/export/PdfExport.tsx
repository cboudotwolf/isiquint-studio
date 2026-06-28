"use client";

import { useState } from "react";
import { exportPdf } from "@/lib/music/pdf-export";
import type { Score } from "@/types/music";

interface PdfExportProps {
  score: Score;
}

export default function PdfExport({ score }: PdfExportProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [bw, setBw] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="px-3 py-1.5 text-sm border border-isiq-border rounded hover:bg-isiq-surface text-isiq-text transition-colors"
      >
        PDF ▾
      </button>
      {showOptions && (
        <div className="absolute top-full right-0 mt-1 bg-white border border-isiq-border rounded-lg shadow-lg p-3 z-50 w-48">
          <label className="flex items-center gap-2 text-sm text-isiq-text mb-3">
            <input
              type="checkbox"
              checked={bw}
              onChange={(e) => setBw(e.target.checked)}
              className="w-4 h-4"
            />
            Schwarz-weiß
          </label>
          <button
            onClick={() => {
              exportPdf(score, { bw });
              setShowOptions(false);
            }}
            className="w-full px-3 py-2 bg-isiq-accent text-white rounded-lg text-sm font-medium hover:bg-[#A93226]"
          >
            PDF exportieren
          </button>
        </div>
      )}
    </div>
  );
}
