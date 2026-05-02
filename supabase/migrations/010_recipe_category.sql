-- Add category and icon columns to user recipes table
-- (default_recipes already has these columns)
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS icon text;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS category text;
