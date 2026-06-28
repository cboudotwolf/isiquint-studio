"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import IsiQuintLogo from "@/components/ui/IsiQuintLogo";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-isiq-surface border border-isiq-border rounded-xl p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-center mb-1 text-isiq-text">
          <IsiQuintLogo height={48} />
        </h1>
        <p className="text-center text-isiq-text text-sm mb-6">
          Anmelden
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-error-50 text-error-700 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

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
              className="w-full px-4 py-2 border border-isiq-border rounded-lg bg-isiq-surface text-sm focus:outline-none focus:ring-2 focus:ring-isiq-accent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-isiq-accent text-white py-2.5 rounded-lg font-medium hover:bg-[#A93226] transition-colors disabled:opacity-50"
          >
            {loading ? "Anmelden..." : "Anmelden"}
          </button>
        </form>

        <p className="text-center text-sm text-isiq-text mt-6">
          Noch kein Konto?{" "}
          <Link
            href="/auth/signup"
            className="text-isiq-accent hover:underline font-medium"
          >
            Registrieren
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Laden...</div>}>
      <LoginForm />
    </Suspense>
  );
}
