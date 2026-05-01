-- Add daily_days column: array of day numbers (0=Sun..6=Sat) for daily reminders
-- Default [1,2,3,4,5] = Mon-Fri
ALTER TABLE whatsapp_config ADD COLUMN IF NOT EXISTS daily_days integer[] NOT NULL DEFAULT '{1,2,3,4,5}';

-- Update upsert function to include daily_days
CREATE OR REPLACE FUNCTION upsert_whatsapp_config(
  p_phone text,
  p_api_key text,
  p_daily_enabled boolean,
  p_daily_hour integer,
  p_daily_days integer[],
  p_weekly_enabled boolean,
  p_weekly_day integer,
  p_weekly_hour integer
) RETURNS void AS $$
BEGIN
  INSERT INTO whatsapp_config (user_id, phone, api_key, daily_enabled, daily_hour, daily_days, weekly_enabled, weekly_day, weekly_hour, updated_at)
  VALUES (auth.uid(), p_phone, p_api_key, p_daily_enabled, p_daily_hour, p_daily_days, p_weekly_enabled, p_weekly_day, p_weekly_hour, now())
  ON CONFLICT (user_id) DO UPDATE SET
    phone = p_phone,
    api_key = p_api_key,
    daily_enabled = p_daily_enabled,
    daily_hour = p_daily_hour,
    daily_days = p_daily_days,
    weekly_enabled = p_weekly_enabled,
    weekly_day = p_weekly_day,
    weekly_hour = p_weekly_hour,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
