-- isiQuint Database Schema
-- Exécuter dans la base Supabase pour initialiser les tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Table: scores
-- ============================================================
CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Unbenannt',
  subtitle TEXT,
  key_signature TEXT NOT NULL DEFAULT 'C Major',
  time_signature INTEGER[] NOT NULL DEFAULT '{4,4}',
  tempo INTEGER NOT NULL DEFAULT 120,
  data JSONB NOT NULL DEFAULT '{"measures": [], "showFingerings": true}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Table: score_versions
-- ============================================================
CREATE TABLE IF NOT EXISTS score_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  score_id UUID NOT NULL REFERENCES scores(id) ON DELETE CASCADE,
  label TEXT,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Table: share_links
-- ============================================================
CREATE TABLE IF NOT EXISTS share_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  score_id UUID NOT NULL REFERENCES scores(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  permission TEXT NOT NULL DEFAULT 'read' CHECK (permission IN ('read', 'write')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_scores_user_id ON scores(user_id);
CREATE INDEX IF NOT EXISTS idx_score_versions_score_id ON score_versions(score_id);
CREATE INDEX IF NOT EXISTS idx_share_links_score_id ON share_links(score_id);
CREATE INDEX IF NOT EXISTS idx_share_links_token ON share_links(token);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_links ENABLE ROW LEVEL SECURITY;

-- Scores: users can only see/modify their own
CREATE POLICY "Users can view own scores"
  ON scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scores"
  ON scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scores"
  ON scores FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scores"
  ON scores FOR DELETE
  USING (auth.uid() = user_id);

-- Score versions: linked to score ownership
CREATE POLICY "Users can view own score versions"
  ON score_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM scores
      WHERE scores.id = score_versions.score_id
      AND scores.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own score versions"
  ON score_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM scores
      WHERE scores.id = score_versions.score_id
      AND scores.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own score versions"
  ON score_versions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM scores
      WHERE scores.id = score_versions.score_id
      AND scores.user_id = auth.uid()
    )
  );

-- Share links: anyone with token can read, owner can manage
CREATE POLICY "Anyone can view share links by token"
  ON share_links FOR SELECT
  USING (true);

CREATE POLICY "Users can manage share links for own scores"
  ON share_links FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM scores
      WHERE scores.id = share_links.score_id
      AND scores.user_id = auth.uid()
    )
  );

-- ============================================================
-- Auto-update updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER scores_updated_at
  BEFORE UPDATE ON scores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
