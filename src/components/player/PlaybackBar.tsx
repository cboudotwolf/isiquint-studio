"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import * as Tone from "tone";

interface PlaybackBarProps {
  tempo: number;
  onTempoChange: (tempo: number) => void;
  notes: Array<{ name: string; octave: number; duration: string }>;
  onNotePlay?: (index: number) => void;
}

export default function PlaybackBar({ tempo, onTempoChange, notes, onNotePlay }: PlaybackBarProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(-1);
  const [isLoaded, setIsLoaded] = useState(false);

  const synthRef = useRef<Tone.Synth | null>(null);
  const timeoutsRef = useRef<number[]>([]);

  const initSynth = useCallback(async () => {
    if (synthRef.current) return synthRef.current;

    await Tone.start();

    const synth = new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: { attack: 0.05, decay: 0.2, sustain: 0.4, release: 0.3 },
    }).toDestination();

    synthRef.current = synth;
    setIsLoaded(true);
    return synth;
  }, []);

  const playNote = useCallback(
    async (noteName: string, octave: number, duration: string) => {
      const synth = await initSynth();
      const freq = Tone.Frequency(`${noteName}${octave}`).toFrequency();
      const durMap: Record<string, string> = {
        whole: "1n",
        half: "2n",
        quarter: "4n",
        eighth: "8n",
        sixteenth: "16n",
      };
      synth.triggerAttackRelease(freq, durMap[duration] || "4n");
    },
    [initSynth]
  );

  const stop = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    Tone.Transport.cancel();
    setIsPlaying(false);
    setCurrentNoteIndex(-1);
  }, []);

  const playScore = useCallback(async () => {
    if (isPlaying) {
      stop();
      return;
    }

    if (notes.length === 0) return;

    setIsPlaying(true);
    setCurrentNoteIndex(0);
    const synth = await initSynth();

    const beatDuration = 60 / tempo;

    const durBeats: Record<string, number> = {
      whole: 4,
      half: 2,
      quarter: 1,
      eighth: 0.5,
      sixteenth: 0.25,
    };

    let timeOffset = 0;
    const scheduleTimeouts: number[] = [];

    for (let i = 0; i < notes.length; i++) {
      const note = notes[i];
      const noteDur = durBeats[note.duration] || 1;
      const noteSeconds = beatDuration * noteDur;

      const idx = i;
      const t = window.setTimeout(() => {
        const freq = Tone.Frequency(`${note.name}${note.octave}`).toFrequency();
        const durMap: Record<string, string> = {
          whole: "1n",
          half: "2n",
          quarter: "4n",
          eighth: "8n",
          sixteenth: "16n",
        };
        synth.triggerAttackRelease(freq, durMap[note.duration] || "4n");
        setCurrentNoteIndex(idx);
        onNotePlay?.(idx);
      }, timeOffset * 1000);

      scheduleTimeouts.push(t);
      timeOffset += noteSeconds;
    }

    const endTimeout = window.setTimeout(() => {
      setIsPlaying(false);
      setCurrentNoteIndex(-1);
    }, timeOffset * 1000 + 100);

    scheduleTimeouts.push(endTimeout);
    timeoutsRef.current = scheduleTimeouts;
  }, [isPlaying, notes, tempo, initSynth, stop, onNotePlay]);

  useEffect(() => {
    Tone.Transport.bpm.value = tempo;
  }, [tempo]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="flex items-center gap-3 px-4 py-2 border-t border-isiq-border bg-isiq-surface">
      <button
        onClick={playScore}
        disabled={!isLoaded || notes.length === 0}
        className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
          isPlaying
            ? "bg-isiq-accent text-white"
            : "bg-isiq-surface border border-isiq-border hover:border-isiq-accent"
        } disabled:opacity-30`}
      >
        {isPlaying ? "⏸" : "▶"}
      </button>
      <button
        onClick={stop}
        disabled={!isPlaying}
        className="px-4 py-1.5 rounded text-sm border border-isiq-border hover:bg-isiq-surface disabled:opacity-30"
      >
        ■
      </button>
      {isPlaying && currentNoteIndex >= 0 && (
        <span className="text-xs text-isiq-text ml-2">
          Note {currentNoteIndex + 1}/{notes.length}
        </span>
      )}
      <div className="flex items-center gap-2 ml-4">
        <span className="text-xs text-isiq-text">Tempo:</span>
        <input
          type="range"
          min={40}
          max={160}
          value={tempo}
          onChange={(e) => onTempoChange(parseInt(e.target.value))}
          className="w-24"
        />
        <span className="text-xs text-isiq-text w-12">{tempo} BPM</span>
      </div>
    </div>
  );
}
