"use client";

import { useRef, useState } from "react";
import type { Score } from "@/types/music";
import { importMidi } from "@/lib/music/midi-import";
import { importMuseScoreFile } from "@/lib/music/musicxml-import";

interface ImportDialogProps {
  onImport: (score: Score) => void;
  onClose: () => void;
}

export default function ImportDialog({ onImport, onClose }: ImportDialogProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const name = file.name.toLowerCase();

      if (name.endsWith(".mid") || name.endsWith(".midi")) {
        const buffer = await file.arrayBuffer();
        const score = importMidi(buffer);
        onImport(score);
        onClose();
      } else if (
        name.endsWith(".mscz") ||
        name.endsWith(".mscx") ||
        name.endsWith(".musicxml") ||
        name.endsWith(".mxl") ||
        name.endsWith(".xml")
      ) {
        const score = await importMuseScoreFile(file);
        onImport(score);
        onClose();
      } else {
        setError("Nicht unterstütztes Format. Unterstützt: .mscz, .mscx, .musicxml, .mxl, .mid");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Importieren");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <h2 className="text-lg font-semibold text-isiq-text mb-4">Noten importieren</h2>

        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-isiq-border rounded-lg p-8 text-center cursor-pointer hover:border-isiq-accent transition-colors"
        >
          <p className="text-isiq-text mb-2">Datei hierher ziehen oder klicken</p>
          <p className="text-xs text-isiq-text">
            MuseScore: .mscz, .mscx<br />
            MusicXML: .musicxml, .mxl<br />
            MIDI: .mid, .midi
          </p>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept=".mscz,.mscx,.musicxml,.mxl,.xml,.mid,.midi"
          onChange={handleFile}
          className="hidden"
        />

        {loading && <p className="text-sm text-isiq-text mt-3">Importieren...</p>}
        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-isiq-text hover:text-isiq-accent text-lg"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
