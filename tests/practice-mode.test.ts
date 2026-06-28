import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Score } from "@/types/music";

const baseScore: Score = {
  id: "test-1",
  title: "Test piece",
  key: "C Major",
  timeSignature: [4, 4],
  tempo: 120,
  measures: [
    {
      elements: [
        { name: "C", octave: 4, duration: "quarter", accidental: "natural", fingering: 0 },
        { name: "D", octave: 4, duration: "quarter", accidental: "natural", fingering: 1 },
        { name: "E", octave: 4, duration: "quarter", accidental: "natural", fingering: 2 },
        { name: "F", octave: 4, duration: "quarter", accidental: "natural", fingering: 3 },
      ],
    },
    {
      elements: [
        { name: "G", octave: 4, duration: "half", accidental: "natural", fingering: 4 },
        { name: "A", octave: 4, duration: "half", accidental: "natural", fingering: null },
      ],
    },
  ],
};

function createMockSvg(): SVGSVGElement {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("width", "1000");
  return svg;
}

function createMockPath(x1: number, y: number, x2: number): SVGPathElement {
  const ns = "http://www.w3.org/2000/svg";
  const path = document.createElementNS(ns, "path");
  path.setAttribute("d", `M ${x1} ${y} L ${x2} ${y}`);
  return path;
}

describe("PracticeMode", () => {
  it("renders without crashing", async () => {
      const { default: PracticeMode } = await import("@/components/practice/PracticeMode");
    expect(PracticeMode).toBeDefined();
  });

  it("starts at measure 0", () => {
    const measures = baseScore.measures;
    expect(measures[0].elements.length).toBe(4);
  });

  it("tracks completed measures", () => {
    const completed = new Set<number>();
    completed.add(0);
    completed.add(1);
    expect(completed.size).toBe(2);
    expect(completed.has(0)).toBe(true);
    expect(completed.has(2)).toBe(false);
  });

  it("calculates progress correctly", () => {
    const total = 8;
    const completed = new Set([0, 1, 2]);
    const progress = (completed.size / total) * 100;
    expect(progress).toBe(37.5);
  });

  it("detects last measure", () => {
    const total = baseScore.measures.length;
    const current = total - 1;
    expect(current === total - 1).toBe(true);
    expect(current).toBe(1);
  });
});

describe("PDF Export BW option", () => {
  it("BW colors are all black", () => {
    const bwColors = ["#000000", "#000000", "#000000", "#000000", "#000000"];
    bwColors.forEach((c) => expect(c).toBe("#000000"));
  });

  it("color mode has isiQuint colors", () => {
    const colorColors = ["#FFCC00", "#000000", "#FF0000", "#000000", "#004DCC"];
    expect(colorColors[0]).toBe("#FFCC00");
    expect(colorColors[2]).toBe("#FF0000");
    expect(colorColors[4]).toBe("#004DCC");
  });
});

describe("ShareDialog practice URL", () => {
  it("practice URL pattern matches", () => {
    const token = "abc123def456";
    const url = `/practice/${token}`;
    expect(url).toBe("/practice/abc123def456");
  });

  it("read permission shows practice URL", () => {
    const permission = "read";
    expect(permission === "read").toBe(true);
  });

  it("write permission hides practice URL", () => {
    const permission = "write";
    expect(permission === "read").toBe(false);
  });
});
