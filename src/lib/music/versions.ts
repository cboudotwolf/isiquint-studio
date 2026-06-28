import { createClient } from "@/lib/supabase/client";
import type { Score } from "@/types/music";

export interface ScoreVersion {
  id: string;
  score_id: string;
  version_number: number;
  data: Score;
  label: string | null;
  created_at: string;
}

export async function saveVersion(
  scoreId: string,
  score: Score,
  label?: string
): Promise<ScoreVersion> {
  const supabase = createClient();

  const { data: lastVersion } = await supabase
    .from("score_versions")
    .select("version_number")
    .eq("score_id", scoreId)
    .order("version_number", { ascending: false })
    .limit(1)
    .single();

  const nextVersion = (lastVersion?.version_number ?? 0) + 1;

  const { data, error } = await supabase
    .from("score_versions")
    .insert({
      score_id: scoreId,
      version_number: nextVersion,
      data: score as unknown as Record<string, unknown>,
      label: label ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as unknown as ScoreVersion;
}

export async function getVersions(scoreId: string): Promise<ScoreVersion[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("score_versions")
    .select("*")
    .eq("score_id", scoreId)
    .order("version_number", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as ScoreVersion[];
}

export async function getVersion(
  versionId: string
): Promise<ScoreVersion> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("score_versions")
    .select("*")
    .eq("id", versionId)
    .single();

  if (error) throw error;
  return data as unknown as ScoreVersion;
}
