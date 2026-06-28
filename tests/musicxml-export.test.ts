import { describe, it, expect } from "vitest";
import { generateMusicXml } from "@/lib/music/musicxml-export";
import type { Score } from "@/types/music";

const SIMPLE_SCORE: Score = {
  title: "MuseScore Test",
  key: "G-Dur",
  timeSignature: [3, 4],
  tempo: 100,
  measures: [
    {
      elements: [
        { name: "g", octave: 4, duration: "quarter", accidental: null, fingering: 3, dotted: false, tied: false },
        { name: "a", octave: 4, duration: "quarter", accidental: null, fingering: 0, dotted: false, tied: false },
        { name: "b", octave: 4, duration: "quarter", accidental: null, fingering: 1, dotted: false, tied: false },
      ],
    },
    {
      elements: [
        { name: "c", octave: 5, duration: "half", accidental: null, fingering: 2, dotted: false, tied: false },
        { name: "d", octave: 4, duration: "quarter", accidental: "sharp", fingering: null, dotted: false, tied: false },
      ],
    },
  ],
  showFingerings: true,
};

describe("generateMusicXml", () => {
  it("contains XML header", () => {
    const xml = generateMusicXml(SIMPLE_SCORE);
    expect(xml).toContain('<?xml version="1.0"');
  });

  it("contains score-partwise", () => {
    const xml = generateMusicXml(SIMPLE_SCORE);
    expect(xml).toContain("<score-partwise");
  });

  it("contains title", () => {
    const xml = generateMusicXml(SIMPLE_SCORE);
    expect(xml).toContain("MuseScore Test");
  });

  it("contains key signature (G-Dur = 1 fifth)", () => {
    const xml = generateMusicXml(SIMPLE_SCORE);
    expect(xml).toContain("<fifths>1</fifths>");
  });

  it("contains time signature 3/4", () => {
    const xml = generateMusicXml(SIMPLE_SCORE);
    expect(xml).toContain("<beats>3</beats>");
    expect(xml).toContain("<beat-type>4</beat-type>");
  });

  it("contains tempo", () => {
    const xml = generateMusicXml(SIMPLE_SCORE);
    expect(xml).toContain("<per-minute>100</per-minute>");
  });

  it("contains clef", () => {
    const xml = generateMusicXml(SIMPLE_SCORE);
    expect(xml).toContain("<sign>G</sign>");
  });

  it("contains notes with correct pitch", () => {
    const xml = generateMusicXml(SIMPLE_SCORE);
    expect(xml).toContain("<step>G</step>");
    expect(xml).toContain("<step>A</step>");
    expect(xml).toContain("<step>B</step>");
    expect(xml).toContain("<octave>4</octave>");
  });

  it("contains accidentals", () => {
    const xml = generateMusicXml(SIMPLE_SCORE);
    expect(xml).toContain("<accidental>sharp</accidental>");
  });

  it("contains measure numbers", () => {
    const xml = generateMusicXml(SIMPLE_SCORE);
    expect(xml).toContain('number="1"');
    expect(xml).toContain('number="2"');
  });

  it("contains barline at end", () => {
    const xml = generateMusicXml(SIMPLE_SCORE);
    expect(xml).toContain("<bar-style>light-heavy</bar-style>");
  });

  it("contains part-list", () => {
    const xml = generateMusicXml(SIMPLE_SCORE);
    expect(xml).toContain("<part-list>");
    expect(xml).toContain("Geige");
  });

  it("escapes special characters in title", () => {
    const score = { ...SIMPLE_SCORE, title: 'Test & "Score" <v1>' };
    const xml = generateMusicXml(score);
    expect(xml).toContain("Test &amp; &quot;Score&quot; &lt;v1&gt;");
  });
});
