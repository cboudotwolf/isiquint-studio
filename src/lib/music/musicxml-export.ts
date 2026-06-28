import type { Score, Note, MusicElement } from "@/types/music";
import JSZip from "jszip";

const NOTE_TO_STEP: Record<string, string> = {
  c: "C", d: "D", e: "E", f: "F", g: "G", a: "A", b: "B",
};

const DURATION_TO_XML: Record<string, string> = {
  whole: "1",
  half: "2",
  quarter: "4",
  eighth: "8",
  sixteenth: "16",
};

function keyToFifths(key: Score["key"]): number {
  const map: Record<string, number> = {
    "C-Dur": 0, "G-Dur": 1, "D-Dur": 2,
    "F-Dur": -1, "D-Moll": -2, "A-Moll": -3, "E-Moll": -4,
  };
  return map[key] ?? 0;
}

function noteToXml(note: Note, division: number): string {
  const step = NOTE_TO_STEP[note.name] ?? "C";
  const alter = note.accidental === "sharp" ? 1 : note.accidental === "flat" ? -1 : 0;
  const durDivs = division * (DURATION_TO_XML[note.duration] === "1" ? 4 :
    DURATION_TO_XML[note.duration] === "2" ? 2 :
    DURATION_TO_XML[note.duration] === "4" ? 1 :
    DURATION_TO_XML[note.duration] === "8" ? 0.5 : 0.25);

  let xml = "    <note>\n";
  xml += `      <pitch><step>${step}</step>`;
  if (alter !== 0) xml += `<alter>${alter}</alter>`;
  xml += `<octave>${note.octave}</octave></pitch>\n`;
  xml += `      <duration>${Math.round(durDivs)}</duration>\n`;
  xml += `      <type>${DURATION_TO_XML[note.duration] ?? "quarter"}</type>\n`;
  if (note.dotted) xml += "      <dot/>\n";
  if (note.accidental === "sharp") xml += "      <accidental>sharp</accidental>\n";
  else if (note.accidental === "flat") xml += "      <accidental>flat</accidental>\n";
  else if (note.accidental === "natural") xml += "      <accidental>natural</accidental>\n";
  xml += "    </note>\n";
  return xml;
}

function restToXml(element: MusicElement, division: number): string {
  const durDivs = division * (DURATION_TO_XML[element.duration] === "1" ? 4 :
    DURATION_TO_XML[element.duration] === "2" ? 2 :
    DURATION_TO_XML[element.duration] === "4" ? 1 :
    DURATION_TO_XML[element.duration] === "8" ? 0.5 : 0.25);

  let xml = "    <note>\n";
  xml += "      <rest/>\n";
  xml += `      <duration>${Math.round(durDivs)}</duration>\n`;
  xml += `      <type>${DURATION_TO_XML[element.duration] ?? "quarter"}</type>\n`;
  if (element.dotted) xml += "      <dot/>\n";
  xml += "    </note>\n";
  return xml;
}

export function generateMusicXml(score: Score): string {
  const division = 65536;
  const fifths = keyToFifths(score.key);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="4.0">
  <work>
    <work-title>${escapeXml(score.title)}</work-title>
  </work>
  <identification>
    <creator type="software">isiQuint Studio</creator>
  </identification>
  <part-list>
    <score-part id="P1">
      <part-name>Geige</part-name>
    </score-part>
  </part-list>
  <part id="P1">\n`;

  for (let i = 0; i < score.measures.length; i++) {
    const measure = score.measures[i];
    xml += `    <measure number="${i + 1}">\n`;

    if (i === 0) {
      xml += `      <attributes>\n`;
      xml += `        <divisions>${division}</divisions>\n`;
      xml += `        <key><fifths>${fifths}</fifths></key>\n`;
      xml += `        <time><beats>${score.timeSignature[0]}</beats><beat-type>${score.timeSignature[1]}</beat-type></time>\n`;
      xml += `        <clef><sign>G</sign><line>2</line></clef>\n`;
      xml += `      </attributes>\n`;
      xml += `      <direction placement="above">\n`;
      xml += `        <direction-type><metronome><beat-unit>quarter</beat-unit><per-minute>${score.tempo}</per-minute></metronome></direction-type>\n`;
      xml += `        <sound tempo="${score.tempo}"/>\n`;
      xml += `      </direction>\n`;
    }

    for (const el of measure.elements) {
      if ("name" in el) {
        xml += noteToXml(el as Note, division);
      } else {
        xml += restToXml(el, division);
      }
    }

    if (i === score.measures.length - 1) {
      xml += `      <barline location="right"><bar-style>light-heavy</bar-style></barline>\n`;
    }

    xml += `    </measure>\n`;
  }

  xml += `  </part>\n</score-partwise>\n`;
  return xml;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function exportMuseScore(score: Score): Promise<void> {
  const musicXml = generateMusicXml(score);

  const mscxContent = `<?xml version="1.0" encoding="UTF-8"?>
<MuseScore version="4.00">
  <Score>
    <Part>
      <Staff id="1">
        <StaffType group="pitched">
          <name>stdNormal</name>
        </StaffType>
      </Staff>
    </Part>
    ${convertToMscx(score)}
  </Score>
</MuseScore>`;

  const zip = new JSZip();
  zip.file("META-INF/container.xml", `<?xml version="1.0" encoding="UTF-8"?>
<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0">
  <rootfiles>
    <rootfile full-path="Music.xml"/>
  </rootfiles>
</container>`);
  zip.file("Music.xml", musicXml);
  zip.file("score_style.mss", `<?xml version="1.0" encoding="UTF-8"?>
<scoreStyle/>`);

  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${score.title.replace(/[^a-zA-Z0-9]/g, "_")}.mscz`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function convertToMscx(score: Score): string {
  let xml = "";
  for (let i = 0; i < score.measures.length; i++) {
    xml += `<Measure>\n`;
    for (const el of score.measures[i].elements) {
      if ("name" in el) {
        const note = el as Note;
        xml += `<Chord>\n`;
        xml += `<durationType>${DURATION_TO_XML[note.duration] ?? "quarter"}</durationType>\n`;
        xml += `<Note>\n`;
        xml += `<pitch>${(note.octave + 1) * 12 + { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 }[note.name]}</pitch>\n`;
        xml += `<tpc>${14 + { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 }[note.name]}</tpc>\n`;
        if (note.accidental === "sharp") xml += `<accidental>accidentalSharp</accidental>\n`;
        else if (note.accidental === "flat") xml += `<accidental>accidentalFlat</accidental>\n`;
        xml += `</Note>\n`;
        xml += `</Chord>\n`;
      } else {
        xml += `<Rest>\n`;
        xml += `<durationType>${DURATION_TO_XML[el.duration] ?? "quarter"}</durationType>\n`;
        xml += `</Rest>\n`;
      }
    }
    xml += `</Measure>\n`;
  }
  return xml;
}

export function downloadMusicXml(score: Score) {
  const content = generateMusicXml(score);
  const blob = new Blob([content], { type: "application/xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${score.title.replace(/[^a-zA-Z0-9]/g, "_")}.musicxml`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
