-- WhatsApp reminder configuration per user
CREATE TABLE IF NOT EXISTS whatsapp_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone text NOT NULL DEFAULT '',
  api_key text NOT NULL DEFAULT '',
  daily_enabled boolean NOT NULL DEFAULT false,
  daily_hour integer NOT NULL DEFAULT 9,
  weekly_enabled boolean NOT NULL DEFAULT false,
  weekly_day integer NOT NULL DEFAULT 1, -- 0=Sun, 1=Mon
  weekly_hour integer NOT NULL DEFAULT 8,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- RLS: only own config
ALTER TABLE whatsapp_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own whatsapp config"
  ON whatsapp_config FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own whatsapp config"
  ON whatsapp_config FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own whatsapp config"
  ON whatsapp_config FOR UPDATE
  USING (auth.uid() = user_id);

-- Upsert function for frontend
CREATE OR REPLACE FUNCTION upsert_whatsapp_config(
  p_phone text,
  p_api_key text,
  p_daily_enabled boolean,
  p_daily_hour integer,
  p_weekly_enabled boolean,
  p_weekly_day integer,
  p_weekly_hour integer
) RETURNS void AS $$
BEGIN
  INSERT INTO whatsapp_config (user_id, phone, api_key, daily_enabled, daily_hour, weekly_enabled, weekly_day, weekly_hour, updated_at)
  VALUES (auth.uid(), p_phone, p_api_key, p_daily_enabled, p_daily_hour, p_weekly_enabled, p_weekly_day, p_weekly_hour, now())
  ON CONFLICT (user_id) DO UPDATE SET
    phone = p_phone,
    api_key = p_api_key,
    daily_enabled = p_daily_enabled,
    daily_hour = p_daily_hour,
    weekly_enabled = p_weekly_enabled,
    weekly_day = p_weekly_day,
    weekly_hour = p_weekly_hour,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
