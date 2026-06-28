import jsPDF from "jspdf";
import type { Score } from "@/types/music";

export async function exportPdf(score: Score, options?: { bw?: boolean }) {
  const bw = options?.bw ?? false;
  const ISIQUINT_COLORS = bw
    ? ["#000000", "#000000", "#000000", "#000000", "#000000"]
    : ["#FFCC00", "#000000", "#FF0000", "#000000", "#004DCC"];

  const Vex = await import("vexflow");

  const totalMeasures = score.measures.length;
  const measuresPerLine = totalMeasures <= 4 ? totalMeasures : totalMeasures <= 8 ? 4 : 3;
  const numLines = Math.ceil(totalMeasures / measuresPerLine);

  const staveLineHeight = 100;
  const staveTop = 60;
  const staffWidth = 760;
  const canvasHeight = staveTop + numLines * staveLineHeight + 30;
  const staveLeft = 10;
  const staveWidth = staffWidth - 20;

  const accMap: Record<string, string> = { sharp: "#", flat: "b", natural: "n" };
  const durMap: Record<string, string> = {
    whole: "w", half: "h", quarter: "q", eighth: "8", sixteenth: "16",
  };

  const svgContainer = document.createElement("div");
  svgContainer.style.position = "fixed";
  svgContainer.style.left = "-9999px";
  svgContainer.style.top = "0";
  document.body.appendChild(svgContainer);

  const svgRenderer = new Vex.Renderer(svgContainer, Vex.Renderer.Backends.SVG);
  svgRenderer.resize(staffWidth, canvasHeight);
  const svgCtx = svgRenderer.getContext();

  for (let lineIdx = 0; lineIdx < numLines; lineIdx++) {
    const lineStart = lineIdx * measuresPerLine;
    const lineEnd = Math.min(lineStart + measuresPerLine, totalMeasures);
    const lineMeasures = score.measures.slice(lineStart, lineEnd);
    const y = staveTop + lineIdx * staveLineHeight;

    const stave = new Vex.Stave(staveLeft, y, staveWidth);
    if (lineIdx === 0) {
      stave.addClef("treble").addTimeSignature(`${score.timeSignature[0]}/${score.timeSignature[1]}`);
    } else {
      stave.addClef("treble");
    }
    stave.setEndBarType(lineIdx === numLines - 1 ? Vex.BarlineType.END : Vex.BarlineType.SINGLE);
    stave.setContext(svgCtx).draw();

    const notes = buildNotes(lineMeasures, accMap, durMap);
    if (notes.length > 0) {
      const voice = new Vex.Voice();
      voice.setMode(Vex.Voice.Mode.SOFT);
      voice.addTickables(notes);
      new Vex.Formatter().joinVoices([voice]).format([voice], staveWidth - 40);
      voice.draw(svgCtx, stave);
    }
  }

  const svg = svgContainer.querySelector("svg") as SVGSVGElement;
  const lineYPositions = svg ? extractStaffLineYPositions(svg) : [];
  document.body.removeChild(svgContainer);

  const canvas = document.createElement("canvas");
  canvas.width = staffWidth;
  canvas.height = canvasHeight;
  const vfRenderer = new Vex.Renderer(canvas, Vex.Renderer.Backends.CANVAS);
  vfRenderer.resize(staffWidth, canvasHeight);
  const vfCtx = vfRenderer.getContext();

  for (let lineIdx = 0; lineIdx < numLines; lineIdx++) {
    const lineStart = lineIdx * measuresPerLine;
    const lineEnd = Math.min(lineStart + measuresPerLine, totalMeasures);
    const lineMeasures = score.measures.slice(lineStart, lineEnd);
    const y = staveTop + lineIdx * staveLineHeight;

    const stave = new Vex.Stave(staveLeft, y, staveWidth);
    if (lineIdx === 0) {
      stave.addClef("treble").addTimeSignature(`${score.timeSignature[0]}/${score.timeSignature[1]}`);
    } else {
      stave.addClef("treble");
    }
    stave.setEndBarType(lineIdx === numLines - 1 ? Vex.BarlineType.END : Vex.BarlineType.SINGLE);
    stave.setContext(vfCtx).draw();

    const notes = buildNotes(lineMeasures, accMap, durMap);
    if (notes.length > 0) {
      const voice = new Vex.Voice();
      voice.setMode(Vex.Voice.Mode.SOFT);
      voice.addTickables(notes);
      new Vex.Formatter().joinVoices([voice]).format([voice], staveWidth - 40);
      voice.draw(vfCtx, stave);
    }
  }

  const ctx = canvas.getContext("2d")!;
  lineYPositions.forEach((y, i) => {
    const colorIdx = i % 5;
    ctx.strokeStyle = ISIQUINT_COLORS[colorIdx];
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(staveLeft, y);
    ctx.lineTo(staveLeft + staveWidth, y);
    ctx.stroke();
  });

  const dataUrl = canvas.toDataURL("image/png");

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  pdf.setFontSize(20);
  pdf.setTextColor(bw ? 0 : 192, bw ? 0 : 57, bw ? 0 : 43);
  pdf.text(score.title, margin, 25);

  if (score.subtitle) {
    pdf.setFontSize(11);
    pdf.setTextColor(100, 100, 100);
    pdf.text(score.subtitle, margin, 33);
  }

  const availableWidth = pageWidth - 2 * margin;
  const pdfScale = availableWidth / staffWidth;
  const scaledHeight = canvasHeight * pdfScale;

  pdf.addImage(dataUrl, "PNG", margin, 40, availableWidth, scaledHeight);

  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.text("Erstellt mit isiQuint — isiquint.app", margin, pageHeight - 8);

  pdf.save(`${score.title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
}

function buildNotes(
  measures: Score["measures"],
  accMap: Record<string, string>,
  durMap: Record<string, string>,
) {
  const Vex = require("vexflow");
  const notes: any[] = [];
  for (const measure of measures) {
    for (const el of measure.elements) {
      if ("name" in el) {
        const note = el as any;
        const accidental = note.accidental ? accMap[note.accidental] ?? "" : "";
        const noteStr = `${note.name}${accidental}/${note.octave}`;
        const dur = durMap[note.duration];
        const dots = note.dotted ? "." : "";
        const staveNote = new Vex.StaveNote({
          clef: "treble",
          keys: [noteStr],
          duration: `${dur}${dots}`,
          autoStem: true,
        });
        if (accidental) {
          staveNote.addModifier(new Vex.Accidental(accidental));
        }
        notes.push(staveNote);
      } else {
        const rest = el as any;
        const dur = durMap[rest.duration];
        const dots = rest.dotted ? "." : "";
        const vfRest = new Vex.StaveNote({
          clef: "treble",
          keys: ["b/4"],
          duration: `r${dur}${dots}`,
        });
        notes.push(vfRest);
      }
    }
  }
  return notes;
}

function extractStaffLineYPositions(svg: SVGSVGElement): number[] {
  const allPaths = svg.querySelectorAll("path");
  const candidates: { y: number }[] = [];

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
    if (Math.abs(y1 - y2) < 2 && Math.abs(x2 - x1) > 500) {
      candidates.push({ y: (y1 + y2) / 2 });
    }
  });

  candidates.sort((a, b) => a.y - b.y);

  const levels: number[] = [];
  for (const c of candidates) {
    const last = levels[levels.length - 1];
    if (last !== undefined && Math.abs(c.y - last) < 3) {
      continue;
    }
    levels.push(c.y);
  }

  return levels;
}
