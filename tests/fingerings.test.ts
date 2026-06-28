import { describe, it, expect } from "vitest";
import { getFingering, isFirstPosition, FINGERING_MAP } from "@/lib/data/fingerings";

describe("FINGERING_MAP", () => {
  it("has entries for G3 to E5", () => {
    expect(FINGERING_MAP["G3"]).toBeDefined();
    expect(FINGERING_MAP["E5"]).toBeDefined();
  });

  it("G3 is open string", () => {
    expect(FINGERING_MAP["G3"]).toEqual({ string: "G", finger: 0 });
  });

  it("A4 is open string", () => {
    expect(FINGERING_MAP["A4"]).toEqual({ string: "A", finger: 0 });
  });
});

describe("getFingering", () => {
  it("returns fingering for valid note", () => {
    const f = getFingering("a", 4);
    expect(f).toEqual({ string: "A", finger: 0 });
  });

  it("returns null for unknown note", () => {
    expect(getFingering("x", 4)).toBeNull();
  });

  it("returns fingering for G3", () => {
    const f = getFingering("g", 3);
    expect(f).toEqual({ string: "G", finger: 0 });
  });

  it("returns fingering for B4", () => {
    const f = getFingering("b", 4);
    expect(f).toEqual({ string: "A", finger: 1 });
  });
});

describe("isFirstPosition", () => {
  it("G3 is in first position", () => {
    expect(isFirstPosition("g", 3)).toBe(true);
  });

  it("B4 is not in first position (without extended)", () => {
    expect(isFirstPosition("b", 4)).toBe(false);
  });

  it("C4 is in first position", () => {
    expect(isFirstPosition("c", 4)).toBe(true);
  });

  it("D4 is in first position", () => {
    expect(isFirstPosition("d", 4)).toBe(true);
  });

  it("B4 is in extended position", () => {
    expect(isFirstPosition("b", 4, true)).toBe(true);
  });

  it("E4 is in extended position", () => {
    expect(isFirstPosition("e", 4, true)).toBe(true);
  });

  it("C5 is in extended position", () => {
    expect(isFirstPosition("c", 5, true)).toBe(true);
  });

  it("E5 is in extended position", () => {
    expect(isFirstPosition("e", 5, true)).toBe(true);
  });

  it("F5 is in extended position", () => {
    expect(isFirstPosition("f", 5, true)).toBe(true);
  });

  it("G5 is in extended position", () => {
    expect(isFirstPosition("g", 5, true)).toBe(true);
  });

  it("A5 is not in extended position", () => {
    expect(isFirstPosition("a", 5, true)).toBe(false);
  });

  it("C5 is not in first position without extended", () => {
    expect(isFirstPosition("c", 5)).toBe(false);
  });
});
