export interface FingeringInfo {
  string: "G" | "D" | "A" | "E";
  finger: number;
}

export const FINGERING_MAP: Record<string, FingeringInfo> = {
  "G3": { string: "G", finger: 0 },
  "A3": { string: "G", finger: 1 },
  "B3": { string: "G", finger: 2 },
  "C4": { string: "G", finger: 3 },
  "D4": { string: "D", finger: 0 },
  "E4": { string: "D", finger: 1 },
  "F4": { string: "D", finger: 2 },
  "F#4": { string: "D", finger: 2 },
  "G4": { string: "D", finger: 3 },
  "A4": { string: "A", finger: 0 },
  "B4": { string: "A", finger: 1 },
  "C5": { string: "A", finger: 2 },
  "C#5": { string: "A", finger: 2 },
  "D5": { string: "A", finger: 3 },
  "E5": { string: "E", finger: 0 },
  "F5": { string: "E", finger: 1 },
  "F#5": { string: "E", finger: 1 },
  "G5": { string: "E", finger: 2 },
  "A5": { string: "E", finger: 3 },
};

export const FIRST_POSITION_MIN = "G3";
export const FIRST_POSITION_MAX = "B4";
export const EXTENDED_POSITION_MAX = "E5";

export function getFingering(
  noteName: string,
  octave: number
): FingeringInfo | null {
  const key = `${noteName.toUpperCase()}${octave}`;
  return FINGERING_MAP[key] ?? null;
}

export function isFirstPosition(
  noteName: string,
  octave: number,
  extended = false
): boolean {
  const notes = ["c", "d", "e", "f", "g", "a", "b"];
  const idx = notes.indexOf(noteName.toLowerCase());
  if (idx === -1) return false;
  const maxOctave = extended ? 5 : 4;
  const maxIdx = extended ? 4 : 1;
  if (octave < 3 || octave > maxOctave) return false;
  if (octave === 3) return idx >= 2;
  if (octave === maxOctave) return idx <= maxIdx;
  return true;
}
