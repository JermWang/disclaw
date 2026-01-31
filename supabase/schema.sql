-- ClawCord Supabase Schema
-- Run this in your Supabase SQL Editor

-- Guild Settings Table
CREATE TABLE IF NOT EXISTS guild_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  guild_id TEXT UNIQUE NOT NULL,
  guild_name TEXT,
  channel_id TEXT,
  min_score DECIMAL(3,1) DEFAULT 6.5,
  autopost BOOLEAN DEFAULT false,
  show_volume BOOLEAN DEFAULT true,
  show_holders BOOLEAN DEFAULT true,
  show_links BOOLEAN DEFAULT true,
  policy_preset TEXT DEFAULT 'default',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Call History Table (for tracking what's been posted)
CREATE TABLE IF NOT EXISTS call_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  guild_id TEXT NOT NULL REFERENCES guild_settings(guild_id) ON DELETE CASCADE,
  token_address TEXT NOT NULL,
  token_symbol TEXT,
  score DECIMAL(3,1),
  market_cap BIGINT,
  liquidity BIGINT,
  message_id TEXT,
  posted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_guild_settings_guild_id ON guild_settings(guild_id);
CREATE INDEX IF NOT EXISTS idx_call_history_guild_id ON call_history(guild_id);
CREATE INDEX IF NOT EXISTS idx_call_history_token ON call_history(token_address);
CREATE INDEX IF NOT EXISTS idx_call_history_posted ON call_history(posted_at DESC);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_guild_settings_updated_at ON guild_settings;
CREATE TRIGGER update_guild_settings_updated_at
  BEFORE UPDATE ON guild_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE guild_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_history ENABLE ROW LEVEL SECURITY;

-- Policy for service role (bot) to access all data
CREATE POLICY "Service role can access all guild_settings" ON guild_settings
  FOR ALL USING (true);

CREATE POLICY "Service role can access all call_history" ON call_history
  FOR ALL USING (true);

-- Useful views
CREATE OR REPLACE VIEW recent_calls AS
SELECT 
  ch.*,
  gs.guild_name
FROM call_history ch
JOIN guild_settings gs ON ch.guild_id = gs.guild_id
ORDER BY ch.posted_at DESC
LIMIT 100;

-- Stats view
CREATE OR REPLACE VIEW guild_stats AS
SELECT 
  gs.guild_id,
  gs.guild_name,
  gs.autopost,
  COUNT(ch.id) as total_calls,
  MAX(ch.posted_at) as last_call_at
FROM guild_settings gs
LEFT JOIN call_history ch ON gs.guild_id = ch.guild_id
GROUP BY gs.guild_id, gs.guild_name, gs.autopost;
