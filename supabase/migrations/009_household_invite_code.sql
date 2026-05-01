-- Add unique invite code to households
ALTER TABLE households ADD COLUMN IF NOT EXISTS invite_code text UNIQUE;

-- Generate codes for existing households
UPDATE households SET invite_code = upper(substr(md5(random()::text), 1, 6))
WHERE invite_code IS NULL;

-- Make it NOT NULL with default for new households
ALTER TABLE households ALTER COLUMN invite_code SET DEFAULT upper(substr(md5(random()::text), 1, 6));
ALTER TABLE households ALTER COLUMN invite_code SET NOT NULL;

-- Function to join a household by code
CREATE OR REPLACE FUNCTION join_household_by_code(p_code text)
RETURNS uuid AS $$
DECLARE
  hh_id uuid;
BEGIN
  -- Find household by code (case insensitive)
  SELECT id INTO hh_id FROM households WHERE upper(invite_code) = upper(p_code);

  IF hh_id IS NULL THEN
    RAISE EXCEPTION 'Invalid invite code';
  END IF;

  -- Add user as member
  INSERT INTO household_members (household_id, user_id, role)
  VALUES (hh_id, auth.uid(), 'member')
  ON CONFLICT DO NOTHING;

  RETURN hh_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
