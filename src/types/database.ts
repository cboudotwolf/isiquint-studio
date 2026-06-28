export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          school: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          school?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          school?: string | null;
          created_at?: string;
        };
      };
      scores: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          subtitle: string | null;
          key_signature: string;
          time_signature: number[];
          tempo: number;
          data: Json;
          color_scheme: Json;
          show_fingerings: boolean;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          subtitle?: string | null;
          key_signature?: string;
          time_signature?: number[];
          tempo?: number;
          data: Json;
          color_scheme: Json;
          show_fingerings?: boolean;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          subtitle?: string | null;
          key_signature?: string;
          time_signature?: number[];
          tempo?: number;
          data?: Json;
          color_scheme?: Json;
          show_fingerings?: boolean;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      share_links: {
        Row: {
          id: string;
          score_id: string;
          token: string;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          score_id: string;
          token?: string;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          score_id?: string;
          token?: string;
          expires_at?: string | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
