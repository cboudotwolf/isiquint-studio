import { describe, it, expect } from "vitest";
import { generateLilypond } from "@/lib/music/lilypond-export";
import type { Score } from "@/types/music";

const DEFAULT_SCORE: Score = {
  title: "Testpartitur",
  key: "C-Dur",
  timeSignature: [4, 4],
  tempo: 80,
  measures: [
    {
      elements: [
        { name: "c", octave: 4, duration: "quarter", accidental: null, fingering: 3, dotted: false, tied: false },
        { name: "d", octave: 4, duration: "quarter", accidental: null, fingering: null, dotted: false, tied: false },
        { name: "e", octave: 4, duration: "half", accidental: null, fingering: null, dotted: false, tied: false },
      ],
    },
  ],
  showFingerings: true,
};

describe("generateLilypond", () => {
  it("contains version header", () => {
    const ly = generateLilypond(DEFAULT_SCORE);
    expect(ly).toContain('\\version "2.24.0"');
  });

  it("contains title", () => {
    const ly = generateLilypond(DEFAULT_SCORE);
    expect(ly).toContain('title = "Testpartitur"');
  });

  it("contains time signature", () => {
    const ly = generateLilypond(DEFAULT_SCORE);
    expect(ly).toContain("\\time 4/4");
  });

  it("contains tempo", () => {
    const ly = generateLilypond(DEFAULT_SCORE);
    expect(ly).toContain("\\tempo 4 = 80");
  });

  it("contains color callback", () => {
    const ly = generateLilypond(DEFAULT_SCORE);
    expect(ly).toContain("color-staff-lines");
  });

  it("contains notes", () => {
    const ly = generateLilypond(DEFAULT_SCORE);
    expect(ly).toContain("c-34");
    expect(ly).toContain("d4");
    expect(ly).toContain("e2");
  });

  it("contains fingering for c4", () => {
    const ly = generateLilypond(DEFAULT_SCORE);
    expect(ly).toContain("c-34");
  });

  it("contains tagline", () => {
    const ly = generateLilypond(DEFAULT_SCORE);
    expect(ly).toContain("isiquint.app");
  });

  it("escapes quotes in title", () => {
    const score = { ...DEFAULT_SCORE, title: 'He said "hello"' };
    const ly = generateLilypond(score);
    expect(ly).toContain('title = "He said \\"hello\\""');
  });

  it("includes subtitle when present", () => {
    const score = { ...DEFAULT_SCORE, subtitle: "Untertitel" };
    const ly = generateLilypond(score);
    expect(ly).toContain('subtitle = "Untertitel"');
  });

  it("includes composer when present", () => {
    const score = { ...DEFAULT_SCORE, composer: "J.S. Bach" };
    const ly = generateLilypond(score);
    expect(ly).toContain('composer = "J.S. Bach"');
  });
});
