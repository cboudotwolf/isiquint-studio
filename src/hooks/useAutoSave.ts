import { useEffect, useRef, useCallback } from "react";
import type { Score } from "@/types/music";
import { createClient } from "@/lib/supabase/client";

const SAVE_INTERVAL = 30000;

export function useAutoSave(score: Score, userId?: string) {
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>("");
  const isSavingRef = useRef(false);

  const saveScore = useCallback(
    async (scoreToSave: Score) => {
      if (isSavingRef.current || !userId) return;
      isSavingRef.current = true;

      const serialized = JSON.stringify(scoreToSave);
      if (serialized === lastSavedRef.current) {
        isSavingRef.current = false;
        return;
      }

      try {
        const supabase = createClient();

        if (scoreToSave.id) {
          await supabase.from("scores").update({
            title: scoreToSave.title,
            key_signature: scoreToSave.key,
            time_signature: scoreToSave.timeSignature,
            tempo: scoreToSave.tempo,
            data: scoreToSave as unknown as Record<string, unknown>,
            show_fingerings: scoreToSave.showFingerings,
            updated_at: new Date().toISOString(),
          }).eq("id", scoreToSave.id);
        } else {
          const { data } = await supabase.from("scores").insert({
            user_id: userId,
            title: scoreToSave.title,
            key_signature: scoreToSave.key,
            time_signature: scoreToSave.timeSignature,
            tempo: scoreToSave.tempo,
            data: scoreToSave as unknown as Record<string, unknown>,
            show_fingerings: scoreToSave.showFingerings,
          }).select().single();

          if (data) {
            return data.id;
          }
        }
        lastSavedRef.current = serialized;
      } catch (err) {
        console.error("Auto-save error:", err);
      } finally {
        isSavingRef.current = false;
      }
    },
    [userId]
  );

  useEffect(() => {
    if (!userId) return;

    saveTimerRef.current = setTimeout(() => {
      saveScore(score);
    }, SAVE_INTERVAL);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [score, userId, saveScore]);

  const saveNow = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    return saveScore(score);
  }, [score, saveScore]);

  const isSaved = JSON.stringify(score) === lastSavedRef.current;

  return { saveNow, isSaved, isSaving: isSavingRef.current };
}
