"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import IsiQuintLogo from "@/components/ui/IsiQuintLogo";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [school, setSchool] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          school: school || null,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        display_name: displayName,
        school: school || null,
      });

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-isiq-surface border border-isiq-border rounded-xl p-8 shadow-sm text-center">
            <h1 className="text-2xl font-semibold mb-2 text-isiq-text">
            <IsiQuintLogo height={48} />
          </h1>
          <p className="text-isiq-text mb-4">
            Registrierungs-E-Mail gesendet!
          </p>
          <p className="text-sm text-isiq-text mb-6">
            Bitte prüfe deinen E-Mail-Posteingang und bestätige dein Konto.
          </p>
          <Link
            href="/auth/login"
            className="inline-block bg-isiq-accent text-white px-6 py-2 rounded-lg font-medium hover:bg-[#A93226] transition-colors"
          >
            Zum Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-isiq-surface border border-isiq-border rounded-xl p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-center mb-1 text-isiq-text">
          <span className="text-isiq-accent">isi</span>Quint
        </h1>
        <p className="text-center text-isiq-text text-sm mb-6">
          Neues Konto erstellen
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-error-50 text-error-700 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="displayName"
              className="block text-sm font-medium text-isiq-text mb-1"
            >
              Name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-isiq-border rounded-lg bg-isiq-surface text-sm focus:outline-none focus:ring-2 focus:ring-isiq-accent"
              placeholder="Regine Bubeck-Cinus"
            />
          </div>

          <div>
            <label
              htmlFor="school"
              className="block text-sm font-medium text-isiq-text mb-1"
            >
              Schule (optional)
            </label>
            <input
              id="school"
              type="text"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              className="w-full px-4 py-2 border border-isiq-border rounded-lg bg-isiq-surface text-sm focus:outline-none focus:ring-2 focus:ring-isiq-accent"
              placeholder="Musikschule XYZ"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-isiq-text mb-1"
            >
              E-Mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-isiq-border rounded-lg bg-isiq-surface text-sm focus:outline-none focus:ring-2 focus:ring-isiq-accent"
              placeholder="lehrkraft@beispiel.de"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-isiq-text mb-1"
            >
              Passwort
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 border border-isiq-border rounded-lg bg-isiq-surface text-sm focus:outline-none focus:ring-2 focus:ring-isiq-accent"
              placeholder="Min. 6 Zeichen"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-isiq-accent text-white py-2.5 rounded-lg font-medium hover:bg-[#A93226] transition-colors disabled:opacity-50"
          >
            {loading ? "Registrieren..." : "Registrieren"}
          </button>
        </form>

        <p className="text-center text-sm text-isiq-text mt-6">
          Bereits ein Konto?{" "}
          <Link
            href="/auth/login"
            className="text-isiq-accent hover:underline font-medium"
          >
            Anmelden
          </Link>
        </p>
      </div>
    </div>
  );
}
