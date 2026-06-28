import type { Score, Note, Measure, MusicElement, Duration, NoteName, Accidental } from "@/types/music";
import JSZip from "jszip";

const XML_DURATION_MAP: Record<string, Duration> = {
  "1": "whole",
  "2": "half",
  "4": "quarter",
  "8": "eighth",
  "16": "sixteenth",
  "32": "sixteenth",
};

const DURATION_BEATS: Record<Duration, number> = {
  whole: 4,
  half: 2,
  quarter: 1,
  eighth: 0.5,
  sixteenth: 0.25,
};

const DIA_TO_NOTE: { semitones: number; name: NoteName; accidental: Accidental }[] = [
  { semitones: 0, name: "c", accidental: null },
  { semitones: 1, name: "c", accidental: "sharp" },
  { semitones: 2, name: "d", accidental: null },
  { semitones: 3, name: "d", accidental: "sharp" },
  { semitones: 4, name: "e", accidental: null },
  { semitones: 5, name: "f", accidental: null },
  { semitones: 6, name: "f", accidental: "sharp" },
  { semitones: 7, name: "g", accidental: null },
  { semitones: 8, name: "g", accidental: "sharp" },
  { semitones: 9, name: "a", accidental: null },
  { semitones: 10, name: "a", accidental: "sharp" },
  { semitones: 11, name: "b", accidental: null },
];

const STEP_TO_SEMITONE: Record<string, number> = {
  C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11,
};

function pitchToNoteName(step: string, octave: number, alter: number): { name: NoteName; octave: number; accidental: Accidental } {
  const base = STEP_TO_SEMITONE[step] ?? 0;
  const semitone = ((base + alter) % 12 + 12) % 12;
  const dia = DIA_TO_NOTE[semitone];
  const octaveShift = Math.floor((base + alter) / 12);
  return {
    name: dia.name,
    octave: octave + octaveShift,
    accidental: dia.accidental,
  };
}

function getFingering(name: NoteName, octave: number): number | null {
  const map: Record<string, number> = {
    "g3": 0, "a3": 1, "b3": 2, "c4": 3,
    "d4": 0, "e4": 1, "f4": 2, "g4": 3,
    "a4": 0, "b4": 1,
  };
  return map[`${name}${octave}`] ?? null;
}

function parseXml(text: string): Document {
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "application/xml");
  const error = doc.querySelector("parsererror");
  if (error) throw new Error("Ungültiges XML: " + error.textContent);
  return doc;
}

function textContent(el: Element | null, tag: string): string | null {
  if (!el) return null;
  const child = el.getElementsByTagName(tag)[0];
  return child?.textContent ?? null;
}

function parseMeasure(measureEl: Element): Measure {
  const elements: MusicElement[] = [];
  const children = Array.from(measureEl.children);

  for (const child of children) {
    if (child.tagName === "note") {
      const isRest = child.getElementsByTagName("rest").length > 0;
      const durationXml = textContent(child, "duration");
      const durationType = textContent(child, "type");
      const dotCount = child.getElementsByTagName("dot").length;

      let duration: Duration = "quarter";
      if (durationType && XML_DURATION_MAP[durationType]) {
        duration = XML_DURATION_MAP[durationType];
      } else if (durationXml) {
        const divs = parseInt(durationXml);
        const quarterDivs = 65536 / 4;
        const beats = divs / quarterDur(quarterDivs);
        duration = beatsToDuration(beats);
      }

      if (isRest) {
        elements.push({ duration, dotted: dotCount > 0 });
        continue;
      }

      const pitchEl = child.getElementsByTagName("pitch")[0];
      if (!pitchEl) continue;

      const step = textContent(pitchEl, "step") ?? "C";
      const octave = parseInt(textContent(pitchEl, "octave") ?? "4");
      const alter = parseInt(textContent(pitchEl, "alter") ?? "0");

      const { name, octave: oct, accidental } = pitchToNoteName(step, octave, alter);

      const note: Note = {
        name,
        octave: oct as 3 | 4 | 5,
        duration,
        accidental,
        fingering: getFingering(name, oct) as 0 | 1 | 2 | 3 | 4 | null,
        dotted: dotCount > 0,
        tied: child.getElementsByTagName("tie").length > 0,
      };

      elements.push(note);
    }
  }

  return { elements };
}

function quarterDur(quarterDivs: number): number {
  return quarterDivs;
}

function beatsToDuration(beats: number): Duration {
  if (beats >= 4) return "whole";
  if (beats >= 2) return "half";
  if (beats >= 1) return "quarter";
  if (beats >= 0.5) return "eighth";
  return "sixteenth";
}

function keySignatureFromFifths(fifths: number): Score["key"] {
  const map: Record<number, Score["key"]> = {
    0: "C-Dur",
    1: "G-Dur",
    2: "D-Dur",
    [-1]: "F-Dur",
    [-2]: "D-Moll",
    [-3]: "A-Moll",
    [-4]: "E-Moll",
  };
  return map[fifths] ?? "C-Dur";
}

function keySignatureToFifths(key: Score["key"]): number {
  const map: Record<string, number> = {
    "C-Dur": 0, "G-Dur": 1, "D-Dur": 2,
    "F-Dur": -1, "D-Moll": -2, "A-Moll": -3, "E-Moll": -4,
  };
  return map[key] ?? 0;
}

function timeSignatureFromAttributes(attr: Element): [number, number] | null {
  const timeEl = attr.getElementsByTagName("time")[0];
  if (!timeEl) return null;
  const beats = parseInt(textContent(timeEl, "beats") ?? "4");
  const beatType = parseInt(textContent(timeEl, "beat-type") ?? "4");
  return [beats, beatType];
}

export function parseMusicXml(text: string): Score {
  const doc = parseXml(text);
  const root = doc.documentElement;

  const title = textContent(root, "work-title")
    ?? textContent(root, "movement-title")
    ?? "Importierte Partitur";

  let key: Score["key"] = "C-Dur";
  let timeSignature: [number, number] = [4, 4];
  let tempo = 120;
  const measures: Measure[] = [];

  const parts = root.getElementsByTagName("part");
  if (parts.length === 0) throw new Error("Keine Stimmen (parts) gefunden");

  const part = parts[0];
  const measureEls = part.getElementsByTagName("measure");

  for (let i = 0; i < measureEls.length; i++) {
    const m = measureEls[i];
    const children = Array.from(m.children);

    for (const child of children) {
      if (child.tagName === "attributes") {
        const fifths = parseInt(textContent(child, "fifths") ?? "0");
        key = keySignatureFromFifths(fifths);

        const ts = timeSignatureFromAttributes(child);
        if (ts) timeSignature = ts;
      }
      if (child.tagName === "direction") {
        const soundEl = child.getElementsByTagName("sound")[0];
        if (soundEl) {
          const tempoAttr = soundEl.getAttribute("tempo");
          if (tempoAttr) tempo = parseInt(tempoAttr);
        }
      }
    }

    measures.push(parseMeasure(m));
  }

  return {
    title,
    key,
    timeSignature,
    tempo,
    measures: measures.length > 0 ? measures : [{ elements: [] }],
    showFingerings: true,
  };
}

export function parseMuseScore(text: string): Score {
  return parseMusicXml(text);
}

export async function importMuseScoreFile(file: File): Promise<Score> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".mscz")) {
    const buffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(buffer);

    const mscxFile = Object.keys(zip.files).find(
      (f) => f.endsWith(".mscx") && !zip.files[f].dir
    );

    if (!mscxFile) throw new Error("Keine .mscx Datei in der MuseScore-Archiv gefunden");

    const content = await zip.files[mscxFile].async("text");
    return parseMusicXml(content);
  }

  if (name.endsWith(".mscx") || name.endsWith(".xml")) {
    const text = await file.text();
    return parseMusicXml(text);
  }

  if (name.endsWith(".musicxml") || name.endsWith(".mxl")) {
    if (name.endsWith(".mxl")) {
      const buffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(buffer);
      const xmlFile = Object.keys(zip.files).find(
        (f) => f.endsWith(".xml") && !zip.files[f].dir
      );
      if (!xmlFile) throw new Error("Keine XML-Datei in der MXL-Archiv gefunden");
      const content = await zip.files[xmlFile].async("text");
      return parseMusicXml(content);
    }
    const text = await file.text();
    return parseMusicXml(text);
  }

  throw new Error("Nicht unterstütztes Format");
}
