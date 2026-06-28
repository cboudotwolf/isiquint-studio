import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import PracticeMode from "@/components/practice/PracticeMode";
import type { Score, Measure, Note } from "@/types/music";

interface PracticePageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: PracticePageProps): Promise<Metadata> {
  const { token } = await params;
  const supabase = await createClient();
  const { data: link } = await supabase
    .from("share_links")
    .select("scores!inner(title)")
    .eq("token", token)
    .single();
  const title = (link as any)?.scores?.title;
  return { title: title ? `${title} — isiQuint Üben` : "Partitur üben — isiQuint" };
}

export default async function PracticePage({ params }: PracticePageProps) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: link, error } = await supabase
    .from("share_links")
    .select("*, scores(*)")
    .eq("token", token)
    .single();

  if (error || !link) notFound();
  if (link.expires_at && new Date(link.expires_at) < new Date()) notFound();

  const scoreData = link.scores as {
    id: string;
    title: string;
    key_signature: string;
    time_signature: number[];
    tempo: number;
    data: {
      measures: Array<{
        elements: Array<{
          name?: string;
          octave?: number;
          duration: string;
          accidental?: string;
          fingering?: number | null;
          dotted?: boolean;
          tied?: boolean;
        }>;
      }>;
      showFingerings?: boolean;
    };
  } | null;

  if (!scoreData?.data?.measures) notFound();

  const score: Score = {
    id: scoreData.id,
    title: scoreData.title,
    key: scoreData.key_signature as Score["key"],
    timeSignature: scoreData.time_signature as [number, number],
    tempo: scoreData.tempo,
    measures: scoreData.data.measures as Measure[],
    showFingerings: scoreData.data.showFingerings ?? true,
  };

  return <PracticeMode score={score} shareUrl={`/practice/${token}`} />;
}
