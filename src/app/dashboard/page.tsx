import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: scores } = await supabase
    .from("scores")
    .select("id, title, key_signature, tempo, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false }) as {
    data: Array<{
      id: string;
      title: string;
      key_signature: string;
      tempo: number;
      updated_at: string;
    }> | null;
    error: unknown;
  };

  return (
    <DashboardClient
      initialScores={scores ?? []}
      userName={profile?.display_name ?? "Lehrkraft"}
    />
  );
}
