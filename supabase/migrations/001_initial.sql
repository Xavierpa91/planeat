-- PlanEat Database Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Households
CREATE TABLE households (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Household members
CREATE TABLE household_members (
  household_id uuid REFERENCES households(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  PRIMARY KEY (household_id, user_id)
);

-- Household invites (for inviting by email)
CREATE TABLE household_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid REFERENCES households(id) ON DELETE CASCADE,
  email text NOT NULL,
  invited_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Recipes
CREATE TABLE recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid REFERENCES households(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Recipe ingredients (just names, no quantities)
CREATE TABLE recipe_ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid REFERENCES recipes(id) ON DELETE CASCADE,
  name text NOT NULL
);

-- Weekly menus
CREATE TABLE weekly_menus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid REFERENCES households(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (household_id, week_start)
);

-- Menu slots (day + meal type)
CREATE TABLE menu_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id uuid REFERENCES weekly_menus(id) ON DELETE CASCADE,
  day_of_week int NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  meal_type text NOT NULL CHECK (meal_type IN ('lunch', 'dinner')),
  recipe_id uuid REFERENCES recipes(id) ON DELETE SET NULL,
  custom_meal text,
  UNIQUE (menu_id, day_of_week, meal_type)
);

-- Enable Row Level Security on all tables
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_slots ENABLE ROW LEVEL SECURITY;

-- Helper: get household IDs for the current user
CREATE OR REPLACE FUNCTION my_household_ids()
RETURNS SETOF uuid AS $$
  SELECT household_id FROM household_members WHERE user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- RLS Policies

-- Households: members can see their households
CREATE POLICY "households_select" ON households FOR SELECT
  USING (id IN (SELECT my_household_ids()));

CREATE POLICY "households_insert" ON households FOR INSERT
  WITH CHECK (true);  -- anyone can create a household

-- Household members
CREATE POLICY "members_select" ON household_members FOR SELECT
  USING (household_id IN (SELECT my_household_ids()));

CREATE POLICY "members_insert" ON household_members FOR INSERT
  WITH CHECK (true);  -- controlled by app logic

-- Household invites
CREATE POLICY "invites_select" ON household_invites FOR SELECT
  USING (household_id IN (SELECT my_household_ids()));

CREATE POLICY "invites_insert" ON household_invites FOR INSERT
  WITH CHECK (household_id IN (SELECT my_household_ids()));

-- Recipes: household members can CRUD
CREATE POLICY "recipes_select" ON recipes FOR SELECT
  USING (household_id IN (SELECT my_household_ids()));

CREATE POLICY "recipes_insert" ON recipes FOR INSERT
  WITH CHECK (household_id IN (SELECT my_household_ids()));

CREATE POLICY "recipes_update" ON recipes FOR UPDATE
  USING (household_id IN (SELECT my_household_ids()));

CREATE POLICY "recipes_delete" ON recipes FOR DELETE
  USING (household_id IN (SELECT my_household_ids()));

-- Recipe ingredients: access through recipe's household
CREATE POLICY "ingredients_select" ON recipe_ingredients FOR SELECT
  USING (recipe_id IN (SELECT id FROM recipes WHERE household_id IN (SELECT my_household_ids())));

CREATE POLICY "ingredients_insert" ON recipe_ingredients FOR INSERT
  WITH CHECK (recipe_id IN (SELECT id FROM recipes WHERE household_id IN (SELECT my_household_ids())));

CREATE POLICY "ingredients_update" ON recipe_ingredients FOR UPDATE
  USING (recipe_id IN (SELECT id FROM recipes WHERE household_id IN (SELECT my_household_ids())));

CREATE POLICY "ingredients_delete" ON recipe_ingredients FOR DELETE
  USING (recipe_id IN (SELECT id FROM recipes WHERE household_id IN (SELECT my_household_ids())));

-- Weekly menus
CREATE POLICY "menus_select" ON weekly_menus FOR SELECT
  USING (household_id IN (SELECT my_household_ids()));

CREATE POLICY "menus_insert" ON weekly_menus FOR INSERT
  WITH CHECK (household_id IN (SELECT my_household_ids()));

CREATE POLICY "menus_update" ON weekly_menus FOR UPDATE
  USING (household_id IN (SELECT my_household_ids()));

CREATE POLICY "menus_delete" ON weekly_menus FOR DELETE
  USING (household_id IN (SELECT my_household_ids()));

-- Menu slots: access through menu's household
CREATE POLICY "slots_select" ON menu_slots FOR SELECT
  USING (menu_id IN (SELECT id FROM weekly_menus WHERE household_id IN (SELECT my_household_ids())));

CREATE POLICY "slots_insert" ON menu_slots FOR INSERT
  WITH CHECK (menu_id IN (SELECT id FROM weekly_menus WHERE household_id IN (SELECT my_household_ids())));

CREATE POLICY "slots_update" ON menu_slots FOR UPDATE
  USING (menu_id IN (SELECT id FROM weekly_menus WHERE household_id IN (SELECT my_household_ids())));

CREATE POLICY "slots_delete" ON menu_slots FOR DELETE
  USING (menu_id IN (SELECT id FROM weekly_menus WHERE household_id IN (SELECT my_household_ids())));

-- Function to auto-accept invites on login
-- Call this after a user signs up/in to check for pending invites
CREATE OR REPLACE FUNCTION accept_pending_invites()
RETURNS void AS $$
DECLARE
  invite RECORD;
  user_email text;
BEGIN
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();

  FOR invite IN
    SELECT * FROM household_invites WHERE email = user_email
  LOOP
    INSERT INTO household_members (household_id, user_id, role)
    VALUES (invite.household_id, auth.uid(), 'member')
    ON CONFLICT DO NOTHING;

    DELETE FROM household_invites WHERE id = invite.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
