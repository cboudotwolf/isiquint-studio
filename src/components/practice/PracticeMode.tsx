"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { Score, Note, Measure } from "@/types/music";
import { getFingering } from "@/lib/data/fingerings";
import IsiQuintLogo from "@/components/ui/IsiQuintLogo";
import PlaybackBar from "@/components/player/PlaybackBar";

interface PracticeModeProps {
  score: Score;
  shareUrl?: string;
}

export default function PracticeMode({ score, shareUrl }: PracticeModeProps) {
  const [currentMeasureIndex, setCurrentMeasureIndex] = useState(0);
  const [practiceMode, setPracticeMode] = useState(false);
  const [completedMeasures, setCompletedMeasures] = useState<Set<number>>(new Set());
  const [showFingerings, setShowFingerings] = useState(score.showFingerings);
  const staffContainerRef = useRef<HTMLDivElement>(null);

  const totalMeasures = score.measures.length;
  const isLastMeasure = currentMeasureIndex === totalMeasures - 1;
  const allCompleted = completedMeasures.size === totalMeasures;

  const playbackNotes: Array<{ name: string; octave: number; duration: string }> = [];
  for (const measure of score.measures) {
    for (const el of measure.elements) {
      if ("name" in el) {
        const note = el as Note;
        playbackNotes.push({ name: note.name, octave: note.octave, duration: note.duration });
      }
    }
  }

  const currentMeasureNotes = score.measures[currentMeasureIndex]?.elements
    .filter((el): el is Note => "name" in el) ?? [];

  function handleCompleteMeasure() {
    setCompletedMeasures((prev) => new Set([...prev, currentMeasureIndex]));
    if (!isLastMeasure) {
      setCurrentMeasureIndex((prev) => prev + 1);
    }
  }

  function handleReset() {
    setCompletedMeasures(new Set());
    setCurrentMeasureIndex(0);
    setPracticeMode(false);
  }

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" && !e.shiftKey) {
        e.preventDefault();
        setCurrentMeasureIndex((prev) => Math.min(totalMeasures - 1, prev + 1));
      }
      if (e.key === "ArrowLeft" && !e.shiftKey) {
        e.preventDefault();
        setCurrentMeasureIndex((prev) => Math.max(0, prev - 1));
      }
      if (e.key === "Enter" && practiceMode) {
        e.preventDefault();
        handleCompleteMeasure();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [totalMeasures, practiceMode, currentMeasureIndex, isLastMeasure]);

  useEffect(() => {
    renderStaff();
  }, [currentMeasureIndex, score, showFingerings]);

  async function renderStaff() {
    const wrapper = staffContainerRef.current;
    if (!wrapper) return;

    try {
      const Vex = await import("vexflow");
      wrapper.innerHTML = "";

      const width = Math.max(wrapper.clientWidth || 700, 700);
      const staveHeight = 150;

      const renderer = new Vex.Renderer(wrapper, Vex.Renderer.Backends.SVG);
      renderer.resize(width, staveHeight + 40);
      const context = renderer.getContext();

      const measure = score.measures[currentMeasureIndex];
      if (!measure) return;

      const stave = new Vex.Stave(10, 20, width - 20);
      stave.addClef("treble");
      if (currentMeasureIndex === 0) {
        const [beats, beatType] = score.timeSignature;
        stave.addTimeSignature(`${beats}/${beatType}`);
      }

      const isCompleted = completedMeasures.has(currentMeasureIndex);
      if (isCompleted) {
        stave.setStyle({ fillStyle: "rgba(34, 197, 94, 0.1)" });
      }

      stave.setContext(context).draw();

      const vfNotes: any[] = [];
      for (const el of measure.elements) {
        if ("name" in el) {
          const note = el as Note;
          const accidental = note.accidental === "sharp" ? "#" : note.accidental === "flat" ? "b" : note.accidental === "natural" ? "n" : "";
          const noteStr = `${note.name}${accidental}/${note.octave}`;
          const durMap: Record<string, string> = { whole: "w", half: "h", quarter: "q", eighth: "8", sixteenth: "16" };
          const dur = durMap[note.duration];
          const dots = note.dotted ? "." : "";
          const staveNote = new Vex.StaveNote({ clef: "treble", keys: [noteStr], duration: `${dur}${dots}`, autoStem: true });
          if (note.accidental === "sharp") staveNote.addModifier(new Vex.Accidental("#"));
          else if (note.accidental === "flat") staveNote.addModifier(new Vex.Accidental("b"));
          else if (note.accidental === "natural") staveNote.addModifier(new Vex.Accidental("n"));
          vfNotes.push(staveNote);
        } else {
          const rest = el as any;
          const durMap: Record<string, string> = { whole: "w", half: "h", quarter: "q", eighth: "8", sixteenth: "16" };
          const dur = durMap[rest.duration];
          const dots = rest.dotted ? "." : "";
          vfNotes.push(new Vex.StaveNote({ clef: "treble", keys: ["b/4"], duration: `r${dur}${dots}` }));
        }
      }

      if (vfNotes.length > 0) {
        const voice = new Vex.Voice();
        voice.setMode(Vex.Voice.Mode.SOFT);
        voice.addTickables(vfNotes);
        new Vex.Formatter().joinVoices([voice]).format([voice], width - 60);
        voice.draw(context, stave);
      }

      setTimeout(() => {
        const svg = wrapper.querySelector("svg");
        if (svg) colorizeStaffLines(svg);
      }, 50);
    } catch (err) {
      console.error("Render error:", err);
    }
  }

  function colorizeStaffLines(svg: SVGSVGElement) {
    const colors = ["#FFCC00", "#000000", "#FF0000", "#000000", "#004DCC"];
    const allPaths = svg.querySelectorAll("path");
    const candidates: { el: SVGPathElement; y: number }[] = [];

    allPaths.forEach((path) => {
      const d = path.getAttribute("d") ?? "";
      const match = d.match(/M[\s]*([-\d.]+)[\s,]+([-\d.]+)[\s]*(?:L|l)[\s]*([-\d.]+)[\s,]+([-\d.]+)/);
      if (!match) return;
      const x1 = parseFloat(match[1]);
      const y1 = parseFloat(match[2]);
      const x2 = parseFloat(match[3]);
      const y2 = parseFloat(match[4]);
      if (Math.abs(y1 - y2) < 2 && Math.abs(x2 - x1) > 200) {
        candidates.push({ el: path, y: (y1 + y2) / 2 });
      }
    });

    candidates.sort((a, b) => a.y - b.y);
    const levels: { y: number; els: SVGPathElement[] }[] = [];
    for (const c of candidates) {
      const last = levels[levels.length - 1];
      if (last && Math.abs(c.y - last.y) < 3) {
        last.els.push(c.el);
        last.y = (last.y * (last.els.length - 1) + c.y) / last.els.length;
      } else {
        levels.push({ y: c.y, els: [c.el] });
      }
    }

    if (levels.length < 5) return;
    const staves: { y: number; els: SVGPathElement[] }[][] = [];
    let currentStave: { y: number; els: SVGPathElement[] }[] = [levels[0]];
    for (let i = 1; i < levels.length; i++) {
      const gap = levels[i].y - levels[i - 1].y;
      if (gap < 15 && currentStave.length < 5) {
        currentStave.push(levels[i]);
      } else {
        if (currentStave.length === 5) staves.push(currentStave);
        currentStave = [levels[i]];
      }
    }
    if (currentStave.length === 5) staves.push(currentStave);

    staves.forEach((staveLevels) => {
      staveLevels.forEach((level, i) => {
        if (colors[i]) {
          level.els.forEach((el) => {
            el.setAttribute("stroke", colors[i]);
            el.setAttribute("stroke-width", "1.5");
            el.removeAttribute("fill");
          });
        }
      });
    });
  }

  const progress = totalMeasures > 0 ? (completedMeasures.size / totalMeasures) * 100 : 0;

  return (
    <div className="min-h-screen bg-isiq-bg">
      <nav className="flex items-center justify-between px-6 py-3 border-b border-isiq-border bg-isiq-surface">
        <IsiQuintLogo height={32} />
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-isiq-text">
            <input
              type="checkbox"
              checked={practiceMode}
              onChange={(e) => setPracticeMode(e.target.checked)}
              className="w-4 h-4"
            />
            Übungsmodus
          </label>
          <label className="flex items-center gap-2 text-sm text-isiq-text">
            <input
              type="checkbox"
              checked={showFingerings}
              onChange={(e) => setShowFingerings(e.target.checked)}
              className="w-4 h-4"
            />
            Doigtés
          </label>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-isiq-text mb-1">{score.title}</h1>
        <p className="text-sm text-isiq-text mb-4">
          {score.key} · {score.timeSignature[0]}/{score.timeSignature[1]} · {score.tempo} BPM
        </p>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-isiq-text">
            Takt {currentMeasureIndex + 1} / {totalMeasures}
          </span>
          <span className="text-sm text-isiq-text">
            {completedMeasures.size} / {totalMeasures} geschafft
          </span>
        </div>

        <div
          className="bg-white border border-isiq-border rounded-xl p-4 mb-4"
          ref={staffContainerRef}
        />

        {showFingerings && currentMeasureNotes.length > 0 && (
          <div className="flex justify-center gap-3 mb-4">
            {currentMeasureNotes.map((note, i) => {
              const f = getFingering(note.name, note.octave);
              return (
                <div key={i} className="text-center">
                  <div className="text-lg font-bold text-isiq-text">{note.name.toUpperCase()}</div>
                  {f && (
                    <div className="text-xs text-isiq-text">
                      Saite {f.string} · Finger {f.finger}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setCurrentMeasureIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentMeasureIndex === 0}
            className="flex-1 py-2.5 rounded-lg font-medium border border-isiq-border text-isiq-text hover:border-isiq-accent disabled:opacity-30"
          >
            ← Zurück
          </button>
          {practiceMode && !isLastMeasure && (
            <button
              onClick={handleCompleteMeasure}
              className="flex-1 py-2.5 rounded-lg font-medium bg-green-500 text-white hover:bg-green-600"
            >
              ✓ Geschafft
            </button>
          )}
          {practiceMode && isLastMeasure && !allCompleted && (
            <button
              onClick={handleCompleteMeasure}
              className="flex-1 py-2.5 rounded-lg font-medium bg-green-500 text-white hover:bg-green-600"
            >
              ✓ Fertig!
            </button>
          )}
          <button
            onClick={() => setCurrentMeasureIndex((prev) => Math.min(totalMeasures - 1, prev + 1))}
            disabled={isLastMeasure}
            className="flex-1 py-2.5 rounded-lg font-medium border border-isiq-border text-isiq-text hover:border-isiq-accent disabled:opacity-30"
          >
            Weiter →
          </button>
        </div>

        {allCompleted && practiceMode && (
          <div className="text-center p-6 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-xl font-bold text-green-700 mb-2">🎉 Alle Takte geschafft!</p>
            <button
              onClick={handleReset}
              className="mt-2 px-4 py-2 text-sm font-medium bg-isiq-accent text-white rounded-lg hover:bg-[#A93226]"
            >
              Nochmal üben
            </button>
          </div>
        )}

        <PlaybackBar
          tempo={score.tempo}
          onTempoChange={() => {}}
          notes={playbackNotes}
        />
      </main>
    </div>
  );
}
