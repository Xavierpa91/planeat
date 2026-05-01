-- Auto-accept pending invites: check invites by email, add to household
CREATE OR REPLACE FUNCTION accept_pending_invites()
RETURNS uuid AS $$
DECLARE
  invite_record RECORD;
  user_email text;
BEGIN
  -- Get current user's email
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();

  -- Find oldest pending invite for this email
  SELECT * INTO invite_record
  FROM household_invites
  WHERE lower(email) = lower(user_email)
  ORDER BY created_at ASC
  LIMIT 1;

  IF invite_record IS NULL THEN
    RETURN NULL;
  END IF;

  -- Add user to household
  INSERT INTO household_members (household_id, user_id, role)
  VALUES (invite_record.household_id, auth.uid(), 'member')
  ON CONFLICT DO NOTHING;

  -- Delete the invite
  DELETE FROM household_invites WHERE id = invite_record.id;

  RETURN invite_record.household_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allow members to leave a household (delete their own membership)
CREATE POLICY "members_delete_own" ON household_members FOR DELETE
  USING (user_id = auth.uid());
