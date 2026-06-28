"use client";

import { useState, useEffect } from "react";
import {
  getVersions,
  saveVersion,
  type ScoreVersion,
} from "@/lib/music/versions";
import type { Score } from "@/types/music";

interface VersionHistoryProps {
  scoreId: string;
  currentScore: Score;
  onRestore: (score: Score) => void;
  onClose: () => void;
}

export default function VersionHistory({
  scoreId,
  currentScore,
  onRestore,
  onClose,
}: VersionHistoryProps) {
  const [versions, setVersions] = useState<ScoreVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [label, setLabel] = useState("");

  useEffect(() => {
    getVersions(scoreId)
      .then(setVersions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [scoreId]);

  async function handleSaveVersion() {
    setSaving(true);
    try {
      const v = await saveVersion(scoreId, currentScore, label || undefined);
      setVersions((prev) => [v, ...prev]);
      setLabel("");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  function handleRestore(version: ScoreVersion) {
    onRestore(version.data);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <h2 className="text-lg font-semibold text-isiq-text mb-4">Versionsverlauf</h2>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Version benennen (optional)"
            className="flex-1 px-3 py-2 border border-isiq-border rounded text-sm bg-white text-isiq-text"
          />
          <button
            onClick={handleSaveVersion}
            disabled={saving}
            className="px-4 py-2 bg-isiq-accent text-white text-sm font-medium rounded hover:bg-[#A93226] disabled:opacity-50"
          >
            {saving ? "Speichern..." : "Snapshot speichern"}
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-isiq-text py-4">Laden...</p>
        ) : versions.length === 0 ? (
          <p className="text-sm text-isiq-text py-4">Noch keine Versionen gespeichert.</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {versions.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-isiq-text">
                      v{v.version_number}
                    </span>
                    {v.label && (
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                        {v.label}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-isiq-text mt-0.5">
                    {new Date(v.created_at).toLocaleString("de-DE")}
                  </p>
                </div>
                <button
                  onClick={() => handleRestore(v)}
                  className="text-xs font-medium text-isiq-accent hover:underline"
                >
                  Wiederherstellen
                </button>
              </div>
            ))}
          </div>
        )}

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
