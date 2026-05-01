-- Allow household members to update their household name
CREATE POLICY "households_update" ON households FOR UPDATE
  USING (id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()));
