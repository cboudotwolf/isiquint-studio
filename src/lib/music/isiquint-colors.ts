export const ISIQUNT_COLORS = [
  "#FFCC00",
  "#000000",
  "#FF0000",
  "#000000",
  "#004DCC",
];

export function hexToLilypondRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  if (r === 0 && g === 0 && b === 0) return "#f";
  return `(rgb-color ${r.toFixed(2)} ${g.toFixed(2)} ${b.toFixed(2)})`;
}
