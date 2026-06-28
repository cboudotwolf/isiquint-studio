import type { Score, Note, Measure, MusicElement, Duration, NoteName, Accidental } from "@/types/music";

const DUR_BEATS: Record<string, number> = {
  whole: 4,
  half: 2,
  quarter: 1,
  eighth: 0.5,
  sixteenth: 0.25,
};

const BEAT_TO_DURATION: Record<number, Duration> = {
  4: "whole",
  2: "half",
  1: "quarter",
  0.5: "eighth",
  0.25: "sixteenth",
};

const MIDI_TO_NOTE: string[] = [
  "c", "c", "d", "d", "e", "f", "f", "g", "g", "a", "a", "b",
];

function midiToNoteName(midi: number): { name: NoteName; octave: number; accidental: Accidental } {
  const noteNames: NoteName[] = ["c", "d", "e", "f", "g", "a", "b"];
  const octave = Math.floor(midi / 12) - 1;
  const pitchClass = midi % 12;

  const naturalNotes = [0, 2, 4, 5, 7, 9, 11];
  const closest = naturalNotes.reduce((prev, curr) =>
    Math.abs(curr - pitchClass) < Math.abs(prev - pitchClass) ? curr : prev
  );

  const nameIndex = naturalNotes.indexOf(closest);
  const name = noteNames[nameIndex];

  let accidental: Accidental = null;
  if (pitchClass - closest === 1) accidental = "sharp";
  else if (closest - pitchClass === 1) accidental = "flat";

  return { name, octave, accidental };
}

function beatsToDuration(beats: number): Duration {
  const closest = Object.keys(BEAT_TO_DURATION).reduce((prev, curr) =>
    Math.abs(parseFloat(curr) - beats) < Math.abs(parseFloat(prev) - beats) ? curr : prev
  );
  return BEAT_TO_DURATION[parseFloat(closest)] ?? "quarter";
}

export function importMidi(arrayBuffer: ArrayBuffer): Score {
  const data = new Uint8Array(arrayBuffer);

  if (String.fromCharCode(...data.slice(0, 4)) !== "MThd") {
    throw new Error("Keine gültige MIDI-Datei");
  }

  const headerLength = (data[7] << 24) | (data[6] << 16) | (data[5] << 8) | data[4];
  const format = (data[9] << 8) | data[8];
  const numTracks = (data[11] << 8) | data[10];
  const timeDivision = (data[13] << 8) | data[12];

  let offset = 14 + headerLength;

  const allNotes: { midi: number; tick: number; duration: number }[] = [];
  const tempo = 120;

  for (let t = 0; t < numTracks; t++) {
    if (String.fromCharCode(...data.slice(offset, offset + 4)) !== "MTrk") {
      break;
    }
    const trackLength = (data[offset + 7] << 24) | (data[offset + 6] << 16) | (data[offset + 5] << 8) | data[offset + 4];
    const trackEnd = offset + 8 + trackLength;
    let pos = offset + 8;

    const activeNotes: Map<number, { tick: number; midi: number }> = new Map();
    let currentTick = 0;

    while (pos < trackEnd) {
      let delta = 0;
      let shift = 0;
      let byte: number;
      do {
        byte = data[pos++];
        delta = (delta << 7) | (byte & 0x7f);
        shift += 7;
      } while (byte & 0x80);
      currentTick += delta;

      const status = data[pos++];
      const eventType = status & 0xf0;

      if (eventType === 0x90) {
        const note = data[pos++];
        const velocity = data[pos++];
        if (velocity > 0) {
          activeNotes.set(note, { tick: currentTick, midi: note });
        }
      } else if (eventType === 0x80) {
        const note = data[pos++];
        pos++;
        if (activeNotes.has(note)) {
          const start = activeNotes.get(note)!;
          allNotes.push({
            midi: note,
            tick: start.tick,
            duration: currentTick - start.tick,
          });
          activeNotes.delete(note);
        }
      } else if (status === 0xff) {
        const metaType = data[pos++];
        let length = 0;
        let s = 0;
        do {
          byte = data[pos++];
          length = (length << 7) | (byte & 0x7f);
          s += 7;
        } while (byte & 0x80);
        pos += length;
      } else if (eventType === 0xa0 || eventType === 0xb0 || eventType === 0xe0) {
        pos += 2;
      } else if (eventType === 0xc0 || eventType === 0xd0) {
        pos += 1;
      }
    }

    offset = trackEnd;
  }

  allNotes.sort((a, b) => a.tick - b.tick);

  const ticksPerBeat = timeDivision;
  const measures: Measure[] = [];
  let currentMeasure: MusicElement[] = [];
  let measureBeats = 0;
  const beatsPerMeasure = 4;

  for (const n of allNotes) {
    const durationBeats = n.duration / ticksPerBeat;
    const duration = beatsToDuration(durationBeats);
    const { name, octave, accidental } = midiToNoteName(n.midi);

    const note: Note = {
      name,
      octave: octave as 3 | 4 | 5,
      duration,
      accidental,
      fingering: null,
      dotted: false,
      tied: false,
    };

    currentMeasure.push(note);
    measureBeats += DUR_BEATS[duration] ?? 1;

    if (measureBeats >= beatsPerMeasure) {
      measures.push({ elements: currentMeasure });
      currentMeasure = [];
      measureBeats = 0;
    }
  }

  if (currentMeasure.length > 0) {
    measures.push({ elements: currentMeasure });
  }

  return {
    title: "Importierte Partitur",
    key: "C-Dur",
    timeSignature: [4, 4],
    tempo,
    measures: measures.length > 0 ? measures : [{ elements: [] }],
    showFingerings: true,
  };
}
