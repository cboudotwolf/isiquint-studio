"use client";

import { useState, useEffect } from "react";
import {
  createShareLink,
  getShareLinks,
  revokeShareLink,
  type ShareLinkResult,
} from "@/lib/music/share";

interface ShareDialogProps {
  scoreId: string;
  onClose: () => void;
}

interface ExistingLink {
  id: string;
  token: string;
  permission: string;
  expires_at: string | null;
  created_at: string;
}

export default function ShareDialog({ scoreId, onClose }: ShareDialogProps) {
  const [links, setLinks] = useState<ExistingLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [createdLink, setCreatedLink] = useState<ShareLinkResult | null>(null);
  const [permission, setPermission] = useState<"read" | "write">("read");
  const [expiresHours, setExpiresHours] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getShareLinks(scoreId).then(setLinks).catch(console.error);
  }, [scoreId]);

  async function handleCreate() {
    setLoading(true);
    try {
      const link = await createShareLink(scoreId, permission, expiresHours);
      setCreatedLink(link);
      const updated = await getShareLinks(scoreId);
      setLinks(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRevoke(linkId: string) {
    await revokeShareLink(linkId);
    setLinks((prev) => prev.filter((l) => l.id !== linkId));
  }

  function copyToClipboard() {
    if (!createdLink) return;
    navigator.clipboard.writeText(createdLink.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-isiq-text mb-4">Partitur teilen</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-isiq-text mb-1">Berechtigung</label>
            <div className="flex gap-2">
              <button
                onClick={() => setPermission("read")}
                className={`flex-1 px-3 py-2 rounded text-sm font-medium border transition-colors ${
                  permission === "read"
                    ? "bg-isiq-accent text-white"
                    : "bg-white border-isiq-border text-isiq-text hover:border-isiq-accent"
                }`}
              >
                Nur lesen
              </button>
              <button
                onClick={() => setPermission("write")}
                className={`flex-1 px-3 py-2 rounded text-sm font-medium border transition-colors ${
                  permission === "write"
                    ? "bg-isiq-accent text-white"
                    : "bg-white border-isiq-border text-isiq-text hover:border-isiq-accent"
                }`}
              >
                Lesen + Schreiben
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-isiq-text mb-1">Ablaufzeit</label>
            <select
              value={expiresHours ?? ""}
              onChange={(e) => setExpiresHours(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 border border-isiq-border rounded text-sm bg-white text-isiq-text"
            >
              <option value="">Nie ablaufend</option>
              <option value={1}>1 Stunde</option>
              <option value={24}>24 Stunden</option>
              <option value={168}>7 Tage</option>
              <option value={720}>30 Tage</option>
            </select>
          </div>

          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full bg-isiq-accent text-white py-2.5 rounded-lg font-medium hover:bg-[#A93226] transition-colors disabled:opacity-50"
          >
            {loading ? "Erstellen..." : "Link erstellen"}
          </button>
        </div>

        {createdLink && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-medium text-green-800 mb-2">Link erstellt!</p>
            {permission === "read" && (
              <div className="mb-3">
                <p className="text-xs text-green-700 mb-1 font-medium">Übungsmodus:</p>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={`${typeof window !== "undefined" ? window.location.origin : ""}/practice/${createdLink.token}`}
                    className="flex-1 px-2 py-1 text-xs border border-green-300 rounded bg-white font-mono"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/practice/${createdLink.token}`);
                    }}
                    className="px-3 py-1 text-xs font-medium bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    {copied ? "Kopiert!" : "Kopieren"}
                  </button>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={createdLink.url}
                className="flex-1 px-2 py-1 text-xs border border-green-300 rounded bg-white font-mono"
              />
              <button
                onClick={copyToClipboard}
                className="px-3 py-1 text-xs font-medium bg-green-600 text-white rounded hover:bg-green-700"
              >
                {copied ? "Kopiert!" : "Kopieren"}
              </button>
            </div>
          </div>
        )}

        {links.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-isiq-text mb-2">Vorhandene Links</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {links.map((link) => (
                <div key={link.id} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded">
                  <div>
                    <span className={`px-1.5 py-0.5 rounded font-medium ${
                      link.permission === "write" ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-700"
                    }`}>
                      {link.permission === "write" ? "R/W" : "R"}
                    </span>
                    <span className="ml-2 text-isiq-text">
                      {link.expires_at ? `bis ${new Date(link.expires_at).toLocaleDateString("de-DE")}` : "dauerhaft"}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRevoke(link.id)}
                    className="text-red-500 hover:text-red-700 font-medium"
                  >
                    Entfernen
                  </button>
                </div>
              ))}
            </div>
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
