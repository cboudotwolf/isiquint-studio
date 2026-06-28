import { createClient } from "@/lib/supabase/client";

export interface ShareLinkResult {
  token: string;
  url: string;
  permission: "read" | "write";
}

export async function createShareLink(
  scoreId: string,
  permission: "read" | "write" = "read",
  expiresInHours: number | null = null
): Promise<ShareLinkResult> {
  const supabase = createClient();
  const token = crypto.randomUUID().replace(/-/g, "").slice(0, 24);

  const expiresAt = expiresInHours
    ? new Date(Date.now() + expiresInHours * 3600 * 1000).toISOString()
    : null;

  const { error } = await supabase.from("share_links").insert({
    score_id: scoreId,
    token,
    permission,
    expires_at: expiresAt,
  });

  if (error) throw error;

  const url = `${window.location.origin}/share/${token}`;

  return { token, url, permission };
}

export async function revokeShareLink(linkId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("share_links").delete().eq("id", linkId);
  if (error) throw error;
}

export async function getShareLinks(scoreId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("share_links")
    .select("*")
    .eq("score_id", scoreId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function resolveShareLink(token: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("share_links")
    .select("*, scores(*)")
    .eq("token", token)
    .single();

  if (error) throw error;

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    throw new Error("Link abgelaufen");
  }

  return data;
}
