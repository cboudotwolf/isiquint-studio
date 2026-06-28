export type NoteName = "c" | "d" | "e" | "f" | "g" | "a" | "b";
export type Accidental = "sharp" | "flat" | "natural" | null;
export type Duration = "whole" | "half" | "quarter" | "eighth" | "sixteenth";
export type Octave = 3 | 4 | 5;

export interface Note {
  name: NoteName;
  octave: Octave;
  duration: Duration;
  accidental: Accidental;
  fingering: 0 | 1 | 2 | 3 | 4 | null;
  dotted: boolean;
  tied: boolean;
}

export interface Rest {
  duration: Duration;
  dotted: boolean;
}

export type MusicElement = Note | Rest;

export interface Measure {
  elements: MusicElement[];
}

export type KeySignature =
  | "C-Dur"
  | "G-Dur"
  | "D-Dur"
  | "F-Dur"
  | "D-Moll"
  | "A-Moll"
  | "E-Moll";

export type Season = "Frühling" | "Sommer" | "Herbst" | "Winter" | "Ganzjährig";

export interface Score {
  id?: string;
  title: string;
  subtitle?: string;
  composer?: string;
  key: KeySignature;
  timeSignature: [number, number];
  tempo: number;
  measures: Measure[];
  showFingerings: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  userId?: string;
}

export interface SongMeta {
  nr: number;
  name: string;
  key: KeySignature;
  timeSignature: [number, number];
  season: Season;
  measures: Measure[];
  fingerings: Record<string, number>;
}

export interface DbScore {
  id: string;
  user_id: string;
  title: string;
  subtitle: string | null;
  key_signature: string;
  time_signature: number[];
  tempo: number;
  data: Record<string, unknown>;
  color_scheme: Record<string, string>;
  show_fingerings: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShareLink {
  id: string;
  score_id: string;
  token: string;
  expires_at: string | null;
  created_at: string;
}
