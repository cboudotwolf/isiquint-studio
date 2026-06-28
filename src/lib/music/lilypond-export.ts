import type { Score } from "@/types/music";
import { ISIQUNT_COLORS, hexToLilypondRgb } from "@/lib/music/isiquint-colors";

const COLOR_STAFF_LINES_CALLBACK = `#(define-public ((color-staff-lines . rest) grob)
   (define (index-cell cell dir)
     (if (equal? dir RIGHT) (cdr cell) (car cell)))
   (define (index-set-cell! x dir val)
     (case dir ((-1) (set-car! x val)) ((1) (set-cdr! x val))))
   (let* ((common (ly:grob-system grob))
          (span-points '(0 . 0))
          (thickness (* (ly:grob-property grob 'thickness 1.0)
                        (ly:output-def-lookup (ly:grob-layout grob)
                                              'line-thickness)))
          (width (ly:grob-property grob 'width))
          (line-positions (ly:grob-property grob 'line-positions))
          (staff-space (ly:grob-property grob 'staff-space 1))
          (line-stencil #f)
          (total-lines empty-stencil)
          (colors rest))
     (for-each
      (lambda (dir)
        (if (and (= dir RIGHT) (number? width))
            (set-cdr! span-points width)
            (let* ((bound (ly:spanner-bound grob dir))
                   (bound-ext (ly:grob-extent bound bound X)))
              (index-set-cell! span-points dir
                (ly:grob-relative-coordinate bound common X))
              (if (and (not (ly:item-break-dir bound))
                       (not (interval-empty? bound-ext)))
                  (index-set-cell! span-points dir
                    (+ (index-cell span-points dir)
                       (index-cell bound-ext dir))))))
        (index-set-cell! span-points dir
          (- (index-cell span-points dir) (* dir thickness 0.5))))
      (list LEFT RIGHT))
     (set! span-points
       (coord-translate span-points
         (- (ly:grob-relative-coordinate grob common X))))
     (set! line-stencil
       (make-line-stencil thickness
         (car span-points) 0 (cdr span-points) 0))
     (if (pair? line-positions)
         (for-each (lambda (position)
           (let ((color (if (pair? colors) (car colors) #f)))
             (set! total-lines
               (ly:stencil-add total-lines
                 (ly:stencil-translate-axis
                   (if (color? color)
                       (ly:stencil-in-color line-stencil
                         (first color) (second color) (third color))
                       line-stencil)
                   (* position staff-space 0.5) Y)))
             (and (pair? colors) (set! colors (cdr colors)))))
           line-positions)
         (let* ((line-count (ly:grob-property grob 'line-count 5))
                (height (* (1- line-count) (/ staff-space 2))))
           (do ((i 0 (1+ i)))
               ((= i line-count))
             (let ((color (if (and (pair? colors) (> (length colors) i))
                              (list-ref colors i) #f)))
               (set! total-lines
                 (ly:stencil-add total-lines
                   (ly:stencil-translate-axis
                     (if (color? color)
                         (ly:stencil-in-color line-stencil
                           (first color) (second color) (third color))
                         line-stencil)
                     (- height (* i staff-space)) Y)))))))
     total-lines))
`;

function noteToLilypond(score: Score, note: any): string {
  const accidental = note.accidental === "sharp" ? "is" : note.accidental === "flat" ? "es" : "";
  const durMap: Record<string, string> = {
    whole: "1",
    half: "2",
    quarter: "4",
    eighth: "8",
    sixteenth: "16",
  };
  const dur = durMap[note.duration] || "4";
  const dots = note.dotted ? "." : "";
  const fingering = score.showFingerings && note.fingering !== null ? `-${note.fingering}` : "";
  return `${note.name}${accidental}${fingering}${dur}${dots}`;
}

function restToLilypond(rest: any): string {
  const durMap: Record<string, string> = {
    whole: "1",
    half: "2",
    quarter: "4",
    eighth: "8",
    sixteenth: "16",
  };
  const dur = durMap[rest.duration] || "4";
  const dots = rest.dotted ? "." : "";
  return `r${dur}${dots}`;
}

function measuresToLilypond(score: Score): string {
  return score.measures
    .map((measure) => {
      const elements = measure.elements.map((el) => {
        if ("name" in el) return noteToLilypond(score, el);
        return restToLilypond(el);
      });
      return elements.join(" ");
    })
    .join(" | ");
}

export function generateLilypond(score: Score): string {
  const colors = ISIQUNT_COLORS.map(hexToLilypondRgb);
  const colorArgs = colors.map((c) => (c === "#f" ? "#f" : c)).join(" ");

  return `\\version "2.24.0"

#(set-global-staff-size 20)

${COLOR_STAFF_LINES_CALLBACK}

\\header {
  title = "${score.title.replace(/"/g, '\\"')}"
${score.subtitle ? `  subtitle = "${score.subtitle.replace(/"/g, '\\"')}"` : ""}
${score.composer ? `  composer = "${score.composer.replace(/"/g, '\\"')}"` : ""}
  tagline = "Erstellt mit isiQuint — isiquint.app"
}

\\paper {
  #(set-paper-size "a4")
}

\\score {
  \\new Staff \\with {
    \\override StaffSymbol.color-callback = #(color-staff-lines ${colorArgs})
  } {
    \\clef treble
    \\time ${score.timeSignature[0]}/${score.timeSignature[1]}
    \\tempo 4 = ${score.tempo}
    ${measuresToLilypond(score)}
  }
  \\layout { }
  \\midi {
    \\tempo 4 = ${score.tempo}
  }
}
`;
}

export function downloadLilypond(score: Score) {
  const content = generateLilypond(score);
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${score.title.replace(/[^a-zA-Z0-9]/g, "_")}.ly`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
