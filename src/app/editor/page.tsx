"use client";

import { useState, useCallback, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import IsiQuintLogo from "@/components/ui/IsiQuintLogo";
import { SortableMeasureButton } from "@/components/editor/SortableMeasureButton";
import PlaybackBar from "@/components/player/PlaybackBar";
import ShareDialog from "@/components/editor/ShareDialog";
import VersionHistory from "@/components/editor/VersionHistory";
import ImportDialog from "@/components/editor/ImportDialog";
import type {
  Note,
  Measure,
  Score,
  Duration,
  Accidental,
  NoteName,
  MusicElement,
} from "@/types/music";
import { SONGS } from "@/lib/data/songs";
import { getFingering, isFirstPosition } from "@/lib/data/fingerings";
import { downloadLilypond } from "@/lib/music/lilypond-export";
import PdfExport from "@/components/export/PdfExport";
import { downloadMusicXml, exportMuseScore } from "@/lib/music/musicxml-export";
import { useAutoSave } from "@/hooks/useAutoSave";

const DURATIONS: { value: Duration; label: string; beats: number }[] = [
  { value: "whole", label: "𝅝", beats: 4 },
  { value: "half", label: "𝅗𝅥", beats: 2 },
  { value: "quarter", label: "♩", beats: 1 },
  { value: "eighth", label: "♪", beats: 0.5 },
  { value: "sixteenth", label: "𝅘𝅥𝅯", beats: 0.25 },
];

const NOTES: { name: NoteName; octave: number }[] = [
  { name: "a", octave: 3 },
  { name: "b", octave: 3 },
  { name: "c", octave: 4 },
  { name: "d", octave: 4 },
  { name: "e", octave: 4 },
  { name: "f", octave: 4 },
  { name: "g", octave: 4 },
  { name: "a", octave: 4 },
  { name: "b", octave: 4 },
];

const KEY_SIGNATURES: Score["key"][] = [
  "C-Dur",
  "G-Dur",
  "D-Dur",
  "F-Dur",
  "D-Moll",
  "A-Moll",
  "E-Moll",
];

const TIME_SIGNATURES: [number, number][] = [
  [4, 4],
  [3, 4],
  [2, 4],
  [6, 8],
];

const KEYBOARD_MAP: Record<string, { name: NoteName; octave: number }> = {
  a: { name: "a", octave: 3 },
  b: { name: "b", octave: 3 },
  c: { name: "c", octave: 4 },
  d: { name: "d", octave: 4 },
  e: { name: "e", octave: 4 },
  f: { name: "f", octave: 4 },
  g: { name: "g", octave: 4 },
};

const DEFAULT_SCORE: Score = {
  title: "Neue Partitur",
  key: "C-Dur",
  timeSignature: [4, 4],
  tempo: 80,
  measures: [{ elements: [] }],
  showFingerings: true,
};

function getDurationBeats(duration: Duration, dotted: boolean): number {
  const base = DURATIONS.find((d) => d.value === duration)?.beats ?? 1;
  return dotted ? base * 1.5 : base;
}

function getMeasureBeats(elements: MusicElement[]): number {
  return elements.reduce((sum, el) => {
    if ("name" in el) {
      return sum + getDurationBeats(el.duration, el.dotted);
    }
    return sum + getDurationBeats(el.duration, el.dotted);
  }, 0);
}

function getMeasureCapacity(timeSignature: [number, number]): number {
  const [beats, beatType] = timeSignature;
  if (beatType === 8) return beats * 0.5;
  return beats;
}

function cloneMeasures(measures: Measure[]): Measure[] {
  return measures.map((m) => ({ ...m, elements: [...m.elements] }));
}

function EditorContent() {
  const searchParams = useSearchParams();
  const songNr = searchParams.get("song");

  const [score, setScore] = useState<Score>(DEFAULT_SCORE);
  const [activeDuration, setActiveDuration] = useState<Duration>("quarter");
  const [activeAccidental, setActiveAccidental] = useState<Accidental>(null);
  const [dotted, setDotted] = useState(false);
  const [history, setHistory] = useState<Score[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [saved, setSaved] = useState(true);
  const [isRest, setIsRest] = useState(false);
  const [activeMeasureIndex, setActiveMeasureIndex] = useState(0);
  const [clipboard, setClipboard] = useState<Measure[] | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [playingNoteIndex, setPlayingNoteIndex] = useState(-1);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const staffContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const { saveNow, isSaved: autoSaved } = useAutoSave(score);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = parseInt(String(active.id).replace("measure-", ""));
    const to = parseInt(String(over.id).replace("measure-", ""));
    moveMeasure(from, to);
  }

  const capacity = getMeasureCapacity(score.timeSignature);

  useEffect(() => {
    if (songNr) {
      const song = SONGS.find((s) => s.nr === parseInt(songNr));
      if (song) {
        const measures =
          song.measures.length > 0 ? cloneMeasures(song.measures) : [{ elements: [] }];
        setScore({
          ...DEFAULT_SCORE,
          title: song.name,
          key: song.key,
          timeSignature: song.timeSignature,
          measures,
          showFingerings: Object.keys(song.fingerings).length > 0,
        });
        setActiveMeasureIndex(0);
      }
    }
  }, [songNr]);

  const pushHistory = useCallback(
    (newScore: Score) => {
      setHistory((prev) => {
        const sliced = prev.slice(0, historyIndex + 1);
        return [...sliced, newScore];
      });
      setHistoryIndex((prev) => prev + 1);
      setSaved(false);
    },
    [historyIndex]
  );

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      setScore(history[historyIndex - 1]);
      setSaved(false);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      setScore(history[historyIndex + 1]);
      setSaved(false);
    }
  }, [history, historyIndex]);

  const addElement = useCallback(
    (element: MusicElement) => {
      const newMeasures = cloneMeasures(score.measures);
      const idx = Math.min(activeMeasureIndex, newMeasures.length - 1);
      newMeasures[idx].elements.push(element);

      const newScore = { ...score, measures: newMeasures };
      pushHistory(newScore);
      setScore(newScore);

      const measureBeats = getMeasureBeats(newMeasures[idx].elements);
      if (measureBeats >= capacity) {
        if (idx === newMeasures.length - 1) {
          const newerMeasures = cloneMeasures(newScore.measures);
          newerMeasures.push({ elements: [] });
          const finalScore = { ...newScore, measures: newerMeasures };
          pushHistory(finalScore);
          setScore(finalScore);
          setActiveMeasureIndex(idx + 1);
        } else {
          setActiveMeasureIndex(idx + 1);
        }
      }
    },
    [score, activeMeasureIndex, capacity, pushHistory]
  );

  const addNote = useCallback(
    (name: NoteName, octave: number) => {
      if (isRest) {
        addElement({ duration: activeDuration, dotted } as any);
        return;
      }

      const fingeringInfo = getFingering(name, octave);
      const inRange = isFirstPosition(name, octave, true);
      if (!inRange) return;

      const note: Note = {
        name,
        octave: octave as 3 | 4 | 5,
        duration: activeDuration,
        accidental: activeAccidental,
        fingering: fingeringInfo
          ? (fingeringInfo.finger as 0 | 1 | 2 | 3 | 4)
          : null,
        dotted,
        tied: false,
      };

      addElement(note);
    },
    [activeDuration, activeAccidental, dotted, isRest, addElement]
  );

  const addRest = useCallback(() => {
    const rest = { duration: activeDuration, dotted };
    addElement(rest);
  }, [activeDuration, dotted, addElement]);

  const removeLast = useCallback(() => {
    const newMeasures = cloneMeasures(score.measures);
    for (let i = newMeasures.length - 1; i >= 0; i--) {
      if (newMeasures[i].elements.length > 0) {
        newMeasures[i].elements.pop();
        if (newMeasures[i].elements.length === 0 && newMeasures.length > 1 && i === newMeasures.length - 1) {
          newMeasures.splice(i, 1);
          setActiveMeasureIndex(Math.min(activeMeasureIndex, newMeasures.length - 1));
        } else {
          setActiveMeasureIndex(i);
        }
        break;
      }
    }
    const newScore = { ...score, measures: newMeasures };
    pushHistory(newScore);
    setScore(newScore);
  }, [score, pushHistory, activeMeasureIndex]);

  const addMeasure = useCallback(() => {
    const newMeasures = cloneMeasures(score.measures);
    newMeasures.push({ elements: [] });
    const newScore = { ...score, measures: newMeasures };
    pushHistory(newScore);
    setScore(newScore);
    setActiveMeasureIndex(newMeasures.length - 1);
  }, [score, pushHistory]);

  const removeMeasure = useCallback(() => {
    if (score.measures.length <= 1) return;
    const newMeasures = cloneMeasures(score.measures);
    newMeasures.splice(activeMeasureIndex, 1);
    const newScore = { ...score, measures: newMeasures };
    pushHistory(newScore);
    setScore(newScore);
    setActiveMeasureIndex(Math.min(activeMeasureIndex, newMeasures.length - 1));
  }, [score, pushHistory, activeMeasureIndex]);

  const copyMeasure = useCallback(() => {
    const measure = score.measures[activeMeasureIndex];
    if (measure) {
      setClipboard(cloneMeasures([measure]));
    }
  }, [score, activeMeasureIndex]);

  const pasteMeasure = useCallback(() => {
    if (!clipboard || clipboard.length === 0) return;
    const newMeasures = cloneMeasures(score.measures);
    const pasted = cloneMeasures(clipboard);
    newMeasures.splice(activeMeasureIndex + 1, 0, ...pasted);
    const newScore = { ...score, measures: newMeasures };
    pushHistory(newScore);
    setScore(newScore);
    setActiveMeasureIndex(activeMeasureIndex + pasted.length);
  }, [score, clipboard, activeMeasureIndex, pushHistory]);

  const duplicateMeasure = useCallback(() => {
    const measure = score.measures[activeMeasureIndex];
    if (!measure) return;
    const newMeasures = cloneMeasures(score.measures);
    newMeasures.splice(activeMeasureIndex + 1, 0, { elements: [...measure.elements] });
    const newScore = { ...score, measures: newMeasures };
    pushHistory(newScore);
    setScore(newScore);
    setActiveMeasureIndex(activeMeasureIndex + 1);
  }, [score, activeMeasureIndex, pushHistory]);

  const moveMeasure = useCallback((from: number, to: number) => {
    if (to < 0 || to >= score.measures.length) return;
    const newMeasures = cloneMeasures(score.measures);
    const [moved] = newMeasures.splice(from, 1);
    newMeasures.splice(to, 0, moved);
    const newScore = { ...score, measures: newMeasures };
    pushHistory(newScore);
    setScore(newScore);
    setActiveMeasureIndex(to);
  }, [score, pushHistory]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement) return;

      if (e.ctrlKey && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }
      if ((e.ctrlKey && e.key === "y") || (e.ctrlKey && e.shiftKey && e.key === "z") || (e.ctrlKey && e.shiftKey && e.key === "Z")) {
        e.preventDefault();
        redo();
        return;
      }
      if (e.ctrlKey && e.key === "c") {
        e.preventDefault();
        copyMeasure();
        return;
      }
      if (e.ctrlKey && e.key === "v") {
        e.preventDefault();
        pasteMeasure();
        return;
      }
      if (e.ctrlKey && e.key === "d") {
        e.preventDefault();
        duplicateMeasure();
        return;
      }
      if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        removeLast();
        return;
      }
      if (e.key === "Escape") {
        setActiveMeasureIndex(0);
        return;
      }

      const mapping = KEYBOARD_MAP[e.key.toLowerCase()];
      if (mapping) {
        e.preventDefault();
        addNote(mapping.name, mapping.octave);
        return;
      }

      if (e.key === "r") {
        e.preventDefault();
        setIsRest((prev) => !prev);
        return;
      }
      if (e.key === ".") {
        e.preventDefault();
        setDotted((prev) => !prev);
        return;
      }
      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        addMeasure();
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setActiveMeasureIndex((prev) => Math.max(0, prev - 1));
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setActiveMeasureIndex((prev) =>
          Math.min(score.measures.length - 1, prev + 1)
        );
        return;
      }
      if (e.shiftKey && e.key === "ArrowLeft") {
        e.preventDefault();
        moveMeasure(activeMeasureIndex, activeMeasureIndex - 1);
        return;
      }
      if (e.shiftKey && e.key === "ArrowRight") {
        e.preventDefault();
        moveMeasure(activeMeasureIndex, activeMeasureIndex + 1);
        return;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [addNote, removeLast, undo, redo, addMeasure, copyMeasure, pasteMeasure, duplicateMeasure, moveMeasure, score.measures.length, activeMeasureIndex]);

  async function renderStaff() {
    const wrapper = document.getElementById("vexflow-container");
    if (!wrapper) return;

    try {
      const Vex = await import("vexflow");

      wrapper.innerHTML = "";

      const totalMeasures = score.measures.length;
      const measuresPerLine = Math.max(2, Math.min(4, Math.ceil(Math.sqrt(totalMeasures))));
      const lines: Measure[][] = [];
      for (let i = 0; i < totalMeasures; i += measuresPerLine) {
        lines.push(score.measures.slice(i, i + measuresPerLine));
      }

      const width = Math.max(wrapper.clientWidth || 800, 800);
      const staveHeight = 150;
      const totalHeight = lines.length * staveHeight + 40;

      const renderer = new Vex.Renderer("vexflow-container", Vex.Renderer.Backends.SVG);
      renderer.resize(width, totalHeight);
      const context = renderer.getContext();

      const staveLeft = 10;
      const staveRight = width - 10;
      const totalWidth = staveRight - staveLeft;

      let globalMeasureIndex = 0;

      for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        const lineMeasures = lines[lineIdx];
        const measuresInLine = lineMeasures.length;
        const measureWidth = totalWidth / measuresInLine;
        const lineY = 20 + lineIdx * staveHeight;

        for (let mIdx = 0; mIdx < measuresInLine; mIdx++) {
          const measure = lineMeasures[mIdx];
          const x = staveLeft + mIdx * measureWidth;

          const stave = new Vex.Stave(x, lineY, measureWidth);
          if (mIdx === 0) {
            stave.addClef("treble");
          }
          if (lineIdx === 0 && mIdx === 0) {
            const [beats, beatType] = score.timeSignature;
            stave.addTimeSignature(`${beats}/${beatType}`);
          }
          if (mIdx === measuresInLine - 1) {
            if (lineIdx === lines.length - 1) {
              stave.setEndBarType(Vex.Barline.type.END);
            }
          } else {
            stave.setEndBarType(Vex.Barline.type.SINGLE);
          }

          if (globalMeasureIndex === activeMeasureIndex) {
            stave.setStyle({
              fillStyle: "rgba(192, 57, 43, 0.08)",
            });
          }

          stave.setContext(context).draw();

          const vfNotes: any[] = [];
          for (const el of measure.elements) {
            if ("name" in el) {
              const note = el as Note;
              const accidental = note.accidental
                ? note.accidental === "sharp"
                  ? "#"
                  : note.accidental === "flat"
                    ? "b"
                    : "n"
                : "";
              const noteStr = `${note.name}${accidental}/${note.octave}`;
              const durMap: Record<string, string> = {
                whole: "w",
                half: "h",
                quarter: "q",
                eighth: "8",
                sixteenth: "16",
              };
              const dur = durMap[note.duration];
              const dots = note.dotted ? "." : "";
              const staveNote = new Vex.StaveNote({
                clef: "treble",
                keys: [noteStr],
                duration: `${dur}${dots}`,
                autoStem: true,
              });
              if (note.accidental === "sharp") {
                staveNote.addModifier(new Vex.Accidental("#"));
              } else if (note.accidental === "flat") {
                staveNote.addModifier(new Vex.Accidental("b"));
              } else if (note.accidental === "natural") {
                staveNote.addModifier(new Vex.Accidental("n"));
              }
              vfNotes.push(staveNote);
            } else {
              const rest = el as any;
              const durMap: Record<string, string> = {
                whole: "w",
                half: "h",
                quarter: "q",
                eighth: "8",
                sixteenth: "16",
              };
              const dur = durMap[rest.duration];
              const dots = rest.dotted ? "." : "";
              const vfRest = new Vex.StaveNote({
                clef: "treble",
                keys: ["b/4"],
                duration: `r${dur}${dots}`,
              });
              vfNotes.push(vfRest);
            }
          }

          if (vfNotes.length > 0) {
            const voice = new Vex.Voice();
            voice.setMode(Vex.Voice.Mode.SOFT);
            voice.addTickables(vfNotes);
            new Vex.Formatter()
              .joinVoices([voice])
              .format([voice], measureWidth - 20);
            voice.draw(context, stave);
          }

          globalMeasureIndex++;
        }
      }

      setTimeout(() => {
        const svg = wrapper.querySelector("svg");
        if (svg) {
          svgRef.current = svg;
          colorizeStaffLines(svg);
        }
      }, 100);
    } catch (err) {
      console.error("VexFlow render error:", err);
      wrapper.innerHTML = `<p style="color:red;padding:20px">Erreur VexFlow: ${err}</p>`;
    }
  }

  function colorizeStaffLines(svg: SVGSVGElement) {
    const isiQuintColors = ["#FFCC00", "#000000", "#FF0000", "#000000", "#004DCC"];

    const allPaths = svg.querySelectorAll("path");
    const candidates: { el: SVGPathElement; y: number }[] = [];

    allPaths.forEach((path) => {
      const d = path.getAttribute("d") ?? "";
      const match = d.match(
        /M[\s]*([-\d.]+)[\s,]+([-\d.]+)[\s]*(?:L|l)[\s]*([-\d.]+)[\s,]+([-\d.]+)/
      );
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
        if (currentStave.length === 5) {
          staves.push(currentStave);
        }
        currentStave = [levels[i]];
      }
    }
    if (currentStave.length === 5) {
      staves.push(currentStave);
    }

    staves.forEach((staveLevels) => {
      staveLevels.forEach((level, i) => {
        if (isiQuintColors[i]) {
          level.els.forEach((el) => {
            el.setAttribute("stroke", isiQuintColors[i]);
            el.setAttribute("stroke-width", "1.5");
            el.removeAttribute("fill");
          });
        }
      });
    });
  }

  useEffect(() => {
    renderStaff();
  }, [score, activeMeasureIndex]);

  const activeMeasureBeats = getMeasureBeats(
    score.measures[Math.min(activeMeasureIndex, score.measures.length - 1)]?.elements ?? []
  );

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-3 border-b border-isiq-border bg-isiq-surface">
        <div className="flex items-center gap-4">
          <Link href="/">
            <IsiQuintLogo height={32} />
          </Link>
          <input
            type="text"
            value={score.title}
            onChange={(e) =>
              setScore({ ...score, title: e.target.value })
            }
            className="px-3 py-1 border border-isiq-border rounded text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-isiq-accent"
          />
          <span
            className={`text-xs ${saved && autoSaved ? "text-isiq-text" : "text-isiq-accent"}`}
          >
            {saved && autoSaved ? "Gespeichert" : "Nicht gespeichert"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="px-4 py-2 text-lg font-semibold border border-isiq-border rounded bg-white hover:bg-isiq-surface disabled:opacity-30"
          >
            ↶
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="px-4 py-2 text-lg font-semibold border border-isiq-border rounded bg-white hover:bg-isiq-surface disabled:opacity-30"
          >
            ↷
          </button>
          <button
            onClick={removeLast}
            className="px-4 py-2 text-lg font-semibold border border-isiq-border rounded bg-white hover:bg-isiq-surface"
          >
            ⌫
          </button>
          <div className="w-px h-8 bg-isiq-border mx-1" />
          <button
            onClick={() => setShowImportDialog(true)}
            className="px-4 py-2 text-base font-semibold border border-isiq-border rounded bg-white hover:bg-isiq-surface text-isiq-text"
            title="MIDI importieren"
          >
            Import
          </button>
          <button
            onClick={() => downloadLilypond(score)}
            className="px-4 py-2 text-base font-semibold border border-isiq-border rounded bg-white hover:bg-isiq-surface text-isiq-text"
          >
            .ly
          </button>
          <button
            onClick={() => downloadMusicXml(score)}
            className="px-4 py-2 text-base font-semibold border border-isiq-border rounded bg-white hover:bg-isiq-surface text-isiq-text"
            title="MusicXML exportieren"
          >
            .xml
          </button>
          <button
            onClick={() => exportMuseScore(score)}
            className="px-4 py-2 text-base font-semibold border border-isiq-border rounded bg-white hover:bg-isiq-surface text-isiq-text"
            title="MuseScore (.mscz) exportieren"
          >
            .mscz
          </button>
          <PdfExport score={score} />
          <button
            onClick={() => score.id && setShowVersionHistory(true)}
            disabled={!score.id}
            className="px-4 py-2 text-base font-semibold border border-isiq-border rounded bg-white hover:bg-isiq-surface text-isiq-text disabled:opacity-30"
            title="Versionsverlauf"
          >
            ↻
          </button>
          <button
            onClick={() => score.id && setShowShareDialog(true)}
            disabled={!score.id}
            className="px-4 py-2 text-base font-semibold border border-isiq-border rounded bg-white hover:bg-isiq-surface text-isiq-text disabled:opacity-30"
            title="Partitur teilen"
          >
            🔗
          </button>
          <button
            onClick={() => saveNow()}
            className="px-5 py-2 text-base font-semibold bg-isiq-accent text-white rounded hover:bg-[#A93226]"
          >
            Speichern
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col">
          <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-isiq-border bg-isiq-surface">
            {DURATIONS.map((d) => (
              <button
                key={d.value}
                onClick={() => setActiveDuration(d.value)}
                className={`px-4 py-2 text-lg rounded font-semibold transition-colors ${
                  activeDuration === d.value
                    ? "bg-isiq-accent text-white"
                    : "bg-white border border-isiq-border hover:border-isiq-accent text-isiq-text"
                }`}
              >
                {d.label}
              </button>
            ))}
            <button
              onClick={() => setDotted(!dotted)}
              className={`px-4 py-2 text-lg rounded font-semibold transition-colors ${
                dotted
                  ? "bg-isiq-accent text-white"
                  : "bg-white border border-isiq-border hover:border-isiq-accent text-isiq-text"
              }`}
            >
              .
            </button>
            <div className="w-px h-8 bg-isiq-border mx-1" />
            {(["sharp", "flat", "natural"] as Accidental[]).map((a) => (
              <button
                key={a ?? "none"}
                onClick={() =>
                  setActiveAccidental(activeAccidental === a ? null : a)
                }
                className={`px-4 py-2 text-lg rounded font-semibold transition-colors ${
                  activeAccidental === a
                    ? "bg-isiq-accent text-white"
                    : "bg-white border border-isiq-border hover:border-isiq-accent text-isiq-text"
                }`}
              >
                {a === "sharp" ? "♯" : a === "flat" ? "♭" : "♮"}
              </button>
            ))}
            <div className="w-px h-8 bg-isiq-border mx-1" />
            <button
              onClick={() => setIsRest(!isRest)}
              className={`px-4 py-2 text-base rounded font-semibold transition-colors ${
                isRest
                  ? "bg-isiq-accent text-white"
                  : "bg-white border border-isiq-border hover:border-isiq-accent text-isiq-text"
              }`}
            >
              {isRest ? "Note" : "Pause"}
            </button>
            <div className="w-px h-8 bg-isiq-border mx-1" />
            <button
              onClick={addMeasure}
              className="px-4 py-2 text-base rounded font-semibold bg-white border border-isiq-border hover:border-isiq-accent text-isiq-text"
              title="Neue Takt hinzufügen"
            >
              + Takt
            </button>
            <button
              onClick={removeMeasure}
              disabled={score.measures.length <= 1}
              className="px-4 py-2 text-base rounded font-semibold bg-white border border-isiq-border hover:border-isiq-accent text-isiq-text disabled:opacity-30"
              title="Aktuellen Takt löschen"
            >
              − Takt
            </button>
            <div className="w-px h-8 bg-isiq-border mx-1" />
            <button
              onClick={copyMeasure}
              className="px-4 py-2 text-base rounded font-semibold bg-white border border-isiq-border hover:border-isiq-accent text-isiq-text"
              title="Takt kopieren (Ctrl+C)"
            >
              Kopieren
            </button>
            <button
              onClick={pasteMeasure}
              disabled={!clipboard}
              className="px-4 py-2 text-base rounded font-semibold bg-white border border-isiq-border hover:border-isiq-accent text-isiq-text disabled:opacity-30"
              title="Takt einfügen (Ctrl+V)"
            >
              Einfügen
            </button>
            <button
              onClick={duplicateMeasure}
              className="px-4 py-2 text-base rounded font-semibold bg-white border border-isiq-border hover:border-isiq-accent text-isiq-text"
              title="Takt duplizieren (Ctrl+D)"
            >
              Duplizieren
            </button>
            <div className="w-px h-8 bg-isiq-border mx-1" />
            <button
              onClick={() => moveMeasure(activeMeasureIndex, activeMeasureIndex - 1)}
              disabled={activeMeasureIndex <= 0}
              className="px-3 py-2 text-base rounded font-semibold bg-white border border-isiq-border hover:border-isiq-accent text-isiq-text disabled:opacity-30"
              title="Takt nach links verschieben"
            >
              ←
            </button>
            <button
              onClick={() => moveMeasure(activeMeasureIndex, activeMeasureIndex + 1)}
              disabled={activeMeasureIndex >= score.measures.length - 1}
              className="px-3 py-2 text-base rounded font-semibold bg-white border border-isiq-border hover:border-isiq-accent text-isiq-text disabled:opacity-30"
              title="Takt nach rechts verschieben"
            >
              →
            </button>
          </div>

          <div className="px-4 py-1.5 border-b border-isiq-border bg-isiq-surface flex items-center gap-2">
            <span className="text-xs text-isiq-text">
              Takt {activeMeasureIndex + 1}/{score.measures.length}
            </span>
            <span className="text-xs text-isiq-text">
              ({activeMeasureBeats}/{capacity} Zeitwerte)
            </span>
            <div className="flex-1" />
            <div className="flex gap-1">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={score.measures.map((_, i) => `measure-${i}`)}
                  strategy={horizontalListSortingStrategy}
                >
                  {score.measures.map((_, i) => (
                    <SortableMeasureButton
                      key={i}
                      index={i}
                      isActive={i === activeMeasureIndex}
                      onClick={() => setActiveMeasureIndex(i)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          </div>

          <div
            className="flex-1 overflow-auto p-4 bg-white"
            ref={staffContainerRef}
          >
            <div id="vexflow-container" className="min-w-[800px]" />
          </div>

          <div className="px-4 py-3 border-t border-isiq-border bg-isiq-surface">
            <div className="flex gap-1">
              {NOTES.map(({ name, octave }) => {
                const inRange = isFirstPosition(name, octave, true);
                const keyBinding = Object.entries(KEYBOARD_MAP).find(
                  ([, v]) => v.name === name && v.octave === octave
                )?.[0];
                return (
                  <button
                    key={`${name}${octave}`}
                    onClick={() => addNote(name, octave)}
                    disabled={!inRange}
                    className={`relative flex-1 py-3 text-center rounded font-mono transition-colors ${
                      inRange
                        ? "bg-white border-2 border-isiq-border hover:border-isiq-accent hover:text-isiq-accent shadow-sm"
                        : "bg-gray-100 opacity-30 cursor-not-allowed border-2 border-transparent"
                    }`}
                  >
                    <span className="block text-lg font-bold">{name.toUpperCase()}</span>
                    <span className="block text-xs text-isiq-text">{octave}</span>
                    {keyBinding && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded bg-isiq-accent text-white text-[9px] font-bold flex items-center justify-center leading-none">
                        {keyBinding.toUpperCase()}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="hidden md:block w-72 border-l border-isiq-border bg-isiq-surface p-5 overflow-y-auto">
          <SidebarContent score={score} setScore={setScore} />
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-72 bg-isiq-surface border-l border-isiq-border p-5 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-isiq-text">Einstellungen</h2>
                <button onClick={() => setSidebarOpen(false)} className="text-lg text-isiq-text">✕</button>
              </div>
              <SidebarContent score={score} setScore={setScore} />
            </div>
          </div>
        )}
      </div>

      {(() => {
        const playbackNotes: Array<{ name: string; octave: number; duration: string }> = [];
        for (const measure of score.measures) {
          for (const el of measure.elements) {
            if ("name" in el) {
              const note = el as Note;
              playbackNotes.push({ name: note.name, octave: note.octave, duration: note.duration });
            }
          }
        }
        return (
          <PlaybackBar
            tempo={score.tempo}
            onTempoChange={(t) => setScore({ ...score, tempo: t })}
            notes={playbackNotes}
            onNotePlay={setPlayingNoteIndex}
          />
        );
      })()}

      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed bottom-4 right-4 z-40 w-12 h-12 rounded-full bg-isiq-accent text-white text-xl shadow-lg flex items-center justify-center"
      >
        ⚙
      </button>

      {showShareDialog && score.id && (
        <ShareDialog scoreId={score.id} onClose={() => setShowShareDialog(false)} />
      )}
      {showVersionHistory && score.id && (
        <VersionHistory
          scoreId={score.id}
          currentScore={score}
          onRestore={(restored) => {
            pushHistory(restored);
            setScore(restored);
          }}
          onClose={() => setShowVersionHistory(false)}
        />
      )}
      {showImportDialog && (
        <ImportDialog
          onImport={(imported) => {
            pushHistory(imported);
            setScore(imported);
            setActiveMeasureIndex(0);
          }}
          onClose={() => setShowImportDialog(false)}
        />
      )}
    </div>
  );
}

function SidebarContent({ score, setScore }: { score: Score; setScore: (s: Score) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold mb-2 text-isiq-text">Tonart</h3>
        <select
          value={score.key}
          onChange={(e) =>
            setScore({
              ...score,
              key: e.target.value as Score["key"],
            })
          }
          className="w-full px-3 py-2 border border-isiq-border rounded text-base bg-white text-isiq-text"
        >
          {KEY_SIGNATURES.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="text-base font-semibold mb-2 text-isiq-text">Taktart</h3>
        <div className="flex flex-wrap gap-2">
          {TIME_SIGNATURES.map(([n, d]) => (
            <button
              key={`${n}/${d}`}
              onClick={() =>
                setScore({
                  ...score,
                  timeSignature: [n, d],
                })
              }
              className={`px-4 py-2 text-base font-semibold rounded transition-colors ${
                score.timeSignature[0] === n &&
                score.timeSignature[1] === d
                  ? "bg-isiq-accent text-white"
                  : "bg-white border border-isiq-border hover:border-isiq-accent text-isiq-text"
              }`}
            >
              {n}/{d}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold mb-2 text-isiq-text">
          Tempo: {score.tempo} BPM
        </h3>
        <input
          type="range"
          min={40}
          max={160}
          value={score.tempo}
          onChange={(e) =>
            setScore({
              ...score,
              tempo: parseInt(e.target.value),
            })
          }
          className="w-full h-2"
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="fingerings"
          checked={score.showFingerings}
          onChange={(e) =>
            setScore({
              ...score,
              showFingerings: e.target.checked,
            })
          }
          className="w-4 h-4"
        />
        <label htmlFor="fingerings" className="text-base text-isiq-text">
          Doigtés anzeigen
        </label>
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Laden...</div>}>
      <EditorContent />
    </Suspense>
  );
}
