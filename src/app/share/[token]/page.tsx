import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

interface SharePageProps {
  params: Promise<{ token: string }>;
}

export default async function SharePage({ params }: SharePageProps) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: link, error } = await supabase
    .from("share_links")
    .select("*, scores(*)")
    .eq("token", token)
    .single();

  if (error || !link) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Link ungültig</h1>
          <p className="text-isiq-text mb-4">Dieser Teilungslink existiert nicht.</p>
          <Link href="/" className="text-isiq-accent hover:underline">
            Zur Startseite
          </Link>
        </div>
      </div>
    );
  }

  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Link abgelaufen</h1>
          <p className="text-isiq-text mb-4">Dieser Teilungslink ist nicht mehr gültig.</p>
          <Link href="/" className="text-isiq-accent hover:underline">
            Zur Startseite
          </Link>
        </div>
      </div>
    );
  }

  const score = link.scores as { id: string; title: string; data: Record<string, unknown> } | null;

  if (link.permission === "write") {
    redirect(`/editor?score=${score?.id}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">{score?.title ?? "Partitur"}</h1>
        <p className="text-isiq-text mb-4">Lesezugriff — Partitur ist schreibgeschützt.</p>
        <Link
          href={`/editor?score=${score?.id}`}
          className="inline-block bg-isiq-accent text-white px-6 py-2 rounded-lg font-medium hover:bg-[#A93226] transition-colors"
        >
          Im Editor öffnen
        </Link>
      </div>
    </div>
  );
}
