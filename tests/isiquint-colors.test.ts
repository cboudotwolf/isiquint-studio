import { describe, it, expect } from "vitest";
import { ISIQUNT_COLORS, hexToLilypondRgb } from "@/lib/music/isiquint-colors";

describe("ISIQUNT_COLORS", () => {
  it("has exactly 5 colors", () => {
    expect(ISIQUNT_COLORS).toHaveLength(5);
  });

  it("yellow is first, red is third, blue is fifth", () => {
    expect(ISIQUNT_COLORS[0]).toBe("#FFCC00");
    expect(ISIQUNT_COLORS[2]).toBe("#FF0000");
    expect(ISIQUNT_COLORS[4]).toBe("#004DCC");
  });

  it("positions 1 and 3 are black", () => {
    expect(ISIQUNT_COLORS[1]).toBe("#000000");
    expect(ISIQUNT_COLORS[3]).toBe("#000000");
  });
});

describe("hexToLilypondRgb", () => {
  it("converts red correctly", () => {
    expect(hexToLilypondRgb("#FF0000")).toBe("(rgb-color 1.00 0.00 0.00)");
  });

  it("returns #f for black", () => {
    expect(hexToLilypondRgb("#000000")).toBe("#f");
  });

  it("converts yellow correctly", () => {
    expect(hexToLilypondRgb("#FFCC00")).toBe("(rgb-color 1.00 0.80 0.00)");
  });

  it("converts blue correctly", () => {
    expect(hexToLilypondRgb("#004DCC")).toBe("(rgb-color 0.00 0.30 0.80)");
  });
});
