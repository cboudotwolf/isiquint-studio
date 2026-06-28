"use client";

import { useEffect, useRef, useCallback } from "react";
import type { Score } from "@/types/music";

interface ColoredStaffProps {
  score: Score;
  className?: string;
  activeNoteIndex?: number | null;
}

export default function ColoredStaff({
  score,
  className = "",
  activeNoteIndex = null,
}: ColoredStaffProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const renderedRef = useRef(false);

  const renderStaff = useCallback(async () => {
    if (!containerRef.current) return;

    const { Factory } = await import("vexflow");

    containerRef.current.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.id = `staff-wrapper-${score.id ?? "preview"}`;
    containerRef.current.appendChild(wrapper);

    const vf = new Factory({
      renderer: {
        elementId: wrapper.id,
        width: containerRef.current.clientWidth || 800,
        height: 200,
      },
    });

    const score2 = vf.EasyScore();
    const system = vf.System();

    const notes = score.measures.flatMap((measure) =>
      measure.elements.map((el) => {
        if ("name" in el) {
          const accidental = el.accidental ? el.accidental[0] : "";
          const noteStr = `${el.name}${accidental}/${el.octave}`;
          const durationMap: Record<string, string> = {
            whole: "w",
            half: "h",
            quarter: "q",
            eighth: "8",
            sixteenth: "16",
          };
          const dur = durationMap[el.duration] || "q";
          const dots = el.dotted ? "." : "";
          const noteObj = score2
            .notes(`${noteStr}/${dur}${dots}`, {
              clef: "treble",
              auto_stem: true,
            })[0];
          return noteObj;
        }
        return null;
      }).filter(Boolean)
    );

    system.addStave({
      voices: [vf.Voice().addTickables(notes)],
    });

    vf.draw();

    const svg = wrapper.querySelector("svg");
    if (svg) {
      colorizeStaffLines(svg);
      if (activeNoteIndex !== null) {
        highlightNote(svg, activeNoteIndex);
      }
    }

    renderedRef.current = true;
  }, [score, activeNoteIndex]);

  useEffect(() => {
    renderStaff();
  }, [renderStaff]);

  return (
    <div
      id={`staff-${score.id ?? "preview"}`}
      ref={containerRef}
      className={`w-full overflow-x-auto ${className}`}
    />
  );
}

function colorizeStaffLines(svg: SVGElement) {
  const isiQuintColors = ["#FFCC00", "#000000", "#FF0000", "#000000", "#004DCC"];

  const allPaths = svg.querySelectorAll("path");
  const candidates: { el: SVGPathElement; y: number }[] = [];

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
    if (Math.abs(y1 - y2) < 2 && Math.abs(x2 - x1) > 100) {
      candidates.push({ el: path, y: (y1 + y2) / 2 });
    }
  });

  candidates.sort((a, b) => a.y - b.y);

  const uniqueYs = new Map<number, SVGPathElement>();
  candidates.forEach((c) => {
    const yKey = Math.round(c.y);
    if (!uniqueYs.has(yKey)) {
      uniqueYs.set(yKey, c.el);
    }
  });

  const staffLines = Array.from(uniqueYs.values()).slice(0, 5);

  staffLines.forEach((lineEl, i) => {
    if (isiQuintColors[i]) {
      lineEl.setAttribute("stroke", isiQuintColors[i]);
      lineEl.setAttribute("stroke-width", "1.5");
      lineEl.removeAttribute("fill");
    }
  });
}

function highlightNote(svg: SVGElement, index: number) {
  const noteGroups = svg.querySelectorAll("g.vf-note");
  noteGroups.forEach((group, i) => {
    if (i === index) {
      group.classList.add("playing");
    } else {
      group.classList.remove("playing");
    }
  });
}
