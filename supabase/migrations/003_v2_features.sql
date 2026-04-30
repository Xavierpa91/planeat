-- PlanEat v2 Features Migration
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- Adds: allergens, prep_minutes, name_en, multi-recipe slots, new recipes

-- ============================================================
-- 1. ALTER EXISTING TABLES
-- ============================================================

-- Add columns to default_recipes
ALTER TABLE default_recipes ADD COLUMN IF NOT EXISTS allergens text[] DEFAULT '{}';
ALTER TABLE default_recipes ADD COLUMN IF NOT EXISTS prep_minutes int;
ALTER TABLE default_recipes ADD COLUMN IF NOT EXISTS name_en text;

-- Add allergens to user recipes
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS allergens text[] DEFAULT '{}';

-- Update meal_type constraint to support all 4 types
ALTER TABLE menu_slots DROP CONSTRAINT IF EXISTS menu_slots_meal_type_check;
ALTER TABLE menu_slots ADD CONSTRAINT menu_slots_meal_type_check CHECK (meal_type IN ('breakfast', 'lunch', 'snack', 'dinner'));

-- ============================================================
-- 2. JUNCTION TABLE FOR MULTI-RECIPE PER SLOT
-- ============================================================

CREATE TABLE menu_slot_recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id uuid REFERENCES menu_slots(id) ON DELETE CASCADE,
  recipe_id uuid REFERENCES recipes(id) ON DELETE SET NULL,
  position int DEFAULT 0
);

ALTER TABLE menu_slot_recipes ENABLE ROW LEVEL SECURITY;

-- RLS policies (access through slot -> menu -> household)
CREATE POLICY "slot_recipes_select" ON menu_slot_recipes FOR SELECT
  USING (slot_id IN (
    SELECT ms.id FROM menu_slots ms
    JOIN weekly_menus wm ON ms.menu_id = wm.id
    WHERE wm.household_id IN (SELECT my_household_ids())
  ));

CREATE POLICY "slot_recipes_insert" ON menu_slot_recipes FOR INSERT
  WITH CHECK (slot_id IN (
    SELECT ms.id FROM menu_slots ms
    JOIN weekly_menus wm ON ms.menu_id = wm.id
    WHERE wm.household_id IN (SELECT my_household_ids())
  ));

CREATE POLICY "slot_recipes_delete" ON menu_slot_recipes FOR DELETE
  USING (slot_id IN (
    SELECT ms.id FROM menu_slots ms
    JOIN weekly_menus wm ON ms.menu_id = wm.id
    WHERE wm.household_id IN (SELECT my_household_ids())
  ));

-- ============================================================
-- 3. UPDATE EXISTING 45 RECIPES WITH NEW FIELDS
-- ============================================================

UPDATE default_recipes SET name_en = 'Macaroni with tomato sauce', prep_minutes = 20, allergens = '{gluten,lacteos}' WHERE name = 'Macarrones con tomate';
UPDATE default_recipes SET name_en = 'Spanish omelette', prep_minutes = 25, allergens = '{huevo}' WHERE name = 'Tortilla de patatas';
UPDATE default_recipes SET name_en = 'Roasted chicken', prep_minutes = 45, allergens = '{}' WHERE name = 'Pollo al horno';
UPDATE default_recipes SET name_en = 'Caesar salad', prep_minutes = 15, allergens = '{gluten,lacteos}' WHERE name = 'Ensalada Cesar';
UPDATE default_recipes SET name_en = 'Rice with vegetables', prep_minutes = 25, allergens = '{}' WHERE name = 'Arroz con verduras';
UPDATE default_recipes SET name_en = 'Lentil stew', prep_minutes = 40, allergens = '{}' WHERE name = 'Lentejas';
UPDATE default_recipes SET name_en = 'Homemade pizza', prep_minutes = 30, allergens = '{gluten,lacteos}' WHERE name = 'Pizza casera';
UPDATE default_recipes SET name_en = 'Grilled salmon', prep_minutes = 15, allergens = '{pescado}' WHERE name = 'Salmon a la plancha';
UPDATE default_recipes SET name_en = 'Spaghetti carbonara', prep_minutes = 20, allergens = '{gluten,huevo,lacteos}' WHERE name = 'Espaguetis carbonara';
UPDATE default_recipes SET name_en = 'Chicken wrap', prep_minutes = 15, allergens = '{gluten}' WHERE name = 'Wrap de pollo';
UPDATE default_recipes SET name_en = 'Poke bowl', prep_minutes = 15, allergens = '{pescado,soja}' WHERE name = 'Poke bowl';
UPDATE default_recipes SET name_en = 'Chickpeas with spinach', prep_minutes = 25, allergens = '{}' WHERE name = 'Garbanzos con espinacas';
UPDATE default_recipes SET name_en = 'Grilled chicken', prep_minutes = 15, allergens = '{}' WHERE name = 'Pollo a la plancha';
UPDATE default_recipes SET name_en = 'Beef steaks', prep_minutes = 15, allergens = '{}' WHERE name = 'Filetes de ternera';
UPDATE default_recipes SET name_en = 'Meatballs in sauce', prep_minutes = 35, allergens = '{gluten}' WHERE name = 'Albondigas en salsa';
UPDATE default_recipes SET name_en = 'Chicken curry', prep_minutes = 30, allergens = '{}' WHERE name = 'Pollo al curry';
UPDATE default_recipes SET name_en = 'Homemade burgers', prep_minutes = 20, allergens = '{gluten,lacteos}' WHERE name = 'Hamburguesas caseras';
UPDATE default_recipes SET name_en = 'Salt-crusted pork loin', prep_minutes = 45, allergens = '{}' WHERE name = 'Lomo a la sal';
UPDATE default_recipes SET name_en = 'Hake in green sauce', prep_minutes = 25, allergens = '{pescado}' WHERE name = 'Merluza en salsa verde';
UPDATE default_recipes SET name_en = 'Garlic shrimp', prep_minutes = 10, allergens = '{crustaceos}' WHERE name = 'Gambas al ajillo';
UPDATE default_recipes SET name_en = 'Cod pil pil', prep_minutes = 30, allergens = '{pescado}' WHERE name = 'Bacalao al pil pil';
UPDATE default_recipes SET name_en = 'Grilled tuna', prep_minutes = 10, allergens = '{pescado}' WHERE name = 'Atun a la plancha';
UPDATE default_recipes SET name_en = 'Fried calamari', prep_minutes = 15, allergens = '{gluten,moluscos}' WHERE name = 'Calamares a la romana';
UPDATE default_recipes SET name_en = 'White beans with chorizo', prep_minutes = 40, allergens = '{}' WHERE name = 'Alubias con chorizo';
UPDATE default_recipes SET name_en = 'Chickpea stew', prep_minutes = 40, allergens = '{pescado}' WHERE name = 'Potaje de garbanzos';
UPDATE default_recipes SET name_en = 'Asturian bean stew', prep_minutes = 50, allergens = '{}' WHERE name = 'Fabada asturiana';
UPDATE default_recipes SET name_en = 'Lentil salad', prep_minutes = 15, allergens = '{}' WHERE name = 'Ensalada de lentejas';
UPDATE default_recipes SET name_en = 'Cuban-style rice', prep_minutes = 15, allergens = '{huevo}' WHERE name = 'Arroz a la cubana';
UPDATE default_recipes SET name_en = 'Vegetable paella', prep_minutes = 35, allergens = '{}' WHERE name = 'Paella de verduras';
UPDATE default_recipes SET name_en = 'Fideua', prep_minutes = 30, allergens = '{gluten,crustaceos,moluscos}' WHERE name = 'Fideua';
UPDATE default_recipes SET name_en = 'Pesto pasta', prep_minutes = 15, allergens = '{gluten,lacteos,frutos_secos}' WHERE name = 'Pasta al pesto';
UPDATE default_recipes SET name_en = 'Mushroom risotto', prep_minutes = 30, allergens = '{lacteos}' WHERE name = 'Risotto de champinones';
UPDATE default_recipes SET name_en = 'Mixed salad', prep_minutes = 10, allergens = '{pescado}' WHERE name = 'Ensalada mixta';
UPDATE default_recipes SET name_en = 'Gazpacho', prep_minutes = 10, allergens = '{gluten}' WHERE name = 'Gazpacho';
UPDATE default_recipes SET name_en = 'Pasta salad', prep_minutes = 15, allergens = '{gluten,pescado}' WHERE name = 'Ensalada de pasta';
UPDATE default_recipes SET name_en = 'Hummus with crudites', prep_minutes = 10, allergens = '{}' WHERE name = 'Hummus con crudites';
UPDATE default_recipes SET name_en = 'Scrambled eggs', prep_minutes = 5, allergens = '{huevo}' WHERE name = 'Huevos revueltos';
UPDATE default_recipes SET name_en = 'Broken eggs with ham', prep_minutes = 15, allergens = '{huevo}' WHERE name = 'Huevos rotos con jamon';
UPDATE default_recipes SET name_en = 'Asparagus scramble', prep_minutes = 10, allergens = '{huevo}' WHERE name = 'Revuelto de esparragos';
UPDATE default_recipes SET name_en = 'French omelette', prep_minutes = 5, allergens = '{huevo,lacteos}' WHERE name = 'Tortilla francesa';
UPDATE default_recipes SET name_en = 'Zucchini cream soup', prep_minutes = 25, allergens = '{lacteos}' WHERE name = 'Crema de calabacin';
UPDATE default_recipes SET name_en = 'Carrot cream soup', prep_minutes = 25, allergens = '{}' WHERE name = 'Crema de zanahoria';
UPDATE default_recipes SET name_en = 'Noodle soup', prep_minutes = 20, allergens = '{gluten}' WHERE name = 'Sopa de fideos';
UPDATE default_recipes SET name_en = 'Pumpkin cream soup', prep_minutes = 25, allergens = '{}' WHERE name = 'Crema de calabaza';
UPDATE default_recipes SET name_en = 'French onion soup', prep_minutes = 25, allergens = '{gluten,lacteos}' WHERE name = 'Sopa de cebolla';

-- ============================================================
-- 4. INSERT 30 NEW DEFAULT RECIPES
-- ============================================================

DO $$
DECLARE
  rid uuid;
BEGIN

  -- --------------------------------------------------------
  -- Rapidas (<15min)
  -- --------------------------------------------------------

  -- 46. Tostada con tomate
  INSERT INTO default_recipes (name, name_en, icon, category, prep_minutes, allergens)
  VALUES ('Tostada con tomate', 'Toast with tomato', 'egg', 'Rapidas', 5, '{gluten}')
  RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name)
  VALUES (rid, 'Pan'), (rid, 'Tomate'), (rid, 'Aceite de oliva');

  -- 47. Sandwich mixto
  INSERT INTO default_recipes (name, name_en, icon, category, prep_minutes, allergens)
  VALUES ('Sandwich mixto', 'Ham and cheese sandwich', 'wrap', 'Rapidas', 5, '{gluten,lacteos}')
  RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name)
  VALUES (rid, 'Pan de molde'), (rid, 'Jamon'), (rid, 'Queso');

  -- 48. Quesadillas
  INSERT INTO default_recipes (name, name_en, icon, category, prep_minutes, allergens)
  VALUES ('Quesadillas', 'Quesadillas', 'wrap', 'Rapidas', 10, '{gluten,lacteos}')
  RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name)
  VALUES (rid, 'Tortillas de trigo'), (rid, 'Queso'), (rid, 'Pollo');

  -- 49. Pasta aglio e olio
  INSERT INTO default_recipes (name, name_en, icon, category, prep_minutes, allergens)
  VALUES ('Pasta aglio e olio', 'Garlic and oil pasta', 'pasta', 'Rapidas', 12, '{gluten}')
  RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name)
  VALUES (rid, 'Espaguetis'), (rid, 'Ajo'), (rid, 'Guindilla');

  -- 50. Cuscus con verduras
  INSERT INTO default_recipes (name, name_en, icon, category, prep_minutes, allergens)
  VALUES ('Cuscus con verduras', 'Couscous with vegetables', 'rice', 'Rapidas', 10, '{gluten}')
  RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name)
  VALUES (rid, 'Cuscus'), (rid, 'Calabacin'), (rid, 'Zanahoria'), (rid, 'Pimiento rojo');

  -- 51. Yogur con granola
  INSERT INTO default_recipes (name, name_en, icon, category, prep_minutes, allergens)
  VALUES ('Yogur con granola', 'Yogurt with granola', 'bowl', 'Rapidas', 5, '{gluten,lacteos}')
  RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name)
  VALUES (rid, 'Yogur'), (rid, 'Granola'), (rid, 'Frutas');

  -- 52. Ensalada de tomate
  INSERT INTO default_recipes (name, name_en, icon, category, prep_minutes, allergens)
  VALUES ('Ensalada de tomate', 'Tomato salad', 'salad', 'Rapidas', 5, '{}')
  RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name)
  VALUES (rid, 'Tomate'), (rid, 'Cebolla'), (rid, 'Aceitunas');

  -- 53. Huevos fritos con patatas
  INSERT INTO default_recipes (name, name_en, icon, category, prep_minutes, allergens)
  VALUES ('Huevos fritos con patatas', 'Fried eggs with fries', 'egg', 'Rapidas', 15, '{huevo}')
  RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name)
  VALUES (rid, 'Huevos'), (rid, 'Patatas');

  -- --------------------------------------------------------
  -- Mas espanolas
  -- --------------------------------------------------------

  -- 54. Pisto
  INSERT INTO default_recipes (name, name_en, icon, category, prep_minutes, allergens)
  VALUES ('Pisto', 'Spanish ratatouille', 'bowl', 'Ensaladas', 30, '{}')
  RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name)
  VALUES (rid, 'Calabacin'), (rid, 'Pimiento rojo'), (rid, 'Pimiento verde'), (rid, 'Tomate'), (rid, 'Cebolla');

  -- 55. Salmorejo
  INSERT INTO default_recipes (name, name_en, icon, category, prep_minutes, allergens)
  VALUES ('Salmorejo', 'Salmorejo', 'soup', 'Sopas y Cremas', 10, '{gluten}')
  RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name)
  VALUES (rid, 'Tomate'), (rid, 'Pan'), (rid, 'Ajo'), (rid, 'Vinagre');

  -- 56. Croquetas de jamon
  INSERT INTO default_recipes (name, name_en, icon, category, prep_minutes, allergens)
  VALUES ('Croquetas de jamon', 'Ham croquettes', 'bowl', 'Carnes', 40, '{gluten,lacteos,huevo}')
  RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name)
  VALUES (rid, 'Jamon'), (rid, 'Harina'), (rid, 'Leche'), (rid, 'Huevos'), (rid, 'Pan rallado');

  -- 57. Empanada gallega
  INSERT INTO default_recipes (name, name_en, icon, category, prep_minutes, allergens)
  VALUES ('Empanada gallega', 'Galician pie', 'wrap', 'Carnes', 50, '{gluten}')
  RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name)
  VALUES (rid, 'Harina'), (rid, 'Atun en lata'), (rid, 'Pimiento rojo'), (rid, 'Cebolla'), (rid, 'Tomate');

  -- 58. Pulpo a la gallega
  INSERT INTO default_recipes (name, name_en, icon, category, prep_minutes, allergens)
  VALUES ('Pulpo a la gallega', 'Galician-style octopus', 'fish', 'Pescados', 35, '{moluscos}')
  RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name)
  VALUES (rid, 'Pulpo'), (rid, 'Patatas'), (rid, 'Pimenton');

  -- 59. Patatas bravas
  INSERT INTO default_recipes (name, name_en, icon, category, prep_minutes, allergens)
  VALUES ('Patatas bravas', 'Spicy potatoes', 'bowl', 'Ensaladas', 25, '{}')
  RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name)
  VALUES (rid, 'Patatas'), (rid, 'Tomate frito'), (rid, 'Mayonesa');

  -- 60. Migas
  INSERT INTO default_recipes (name, name_en, icon, category, prep_minutes, allergens)
  VALUES ('Migas', 'Fried breadcrumbs', 'bowl', 'Carnes', 25, '{gluten}')
  RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name)
  VALUES (rid, 'Pan'), (rid, 'Chorizo'), (rid, 'Pimiento verde'), (rid, 'Ajo');

  -- 61. Escalivada
  INSERT INTO default_recipes (name, name_en, icon, category, prep_minutes, allergens)
  VALUES ('Escalivada', 'Roasted vegetables', 'salad', 'Ensaladas', 40, '{}')
  RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name)
  VALUES (rid, 'Berenjena'), (rid, 'Pimiento rojo'), (rid, 'Cebolla'), (rid, 'Tomate');

  -- --------------------------------------------------------
  -- Internacionales populares
  -- --------------------------------------------------------

  -- 62. Tacos de pollo
  INSERT INTO default_recipes (name, name_en, icon, category, prep_minutes, allergens)
  VALUES ('Tacos de pollo', 'Chicken tacos', 'wrap', 'Carnes', 20, '{gluten}')
  RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name)
  VALUES (rid, 'Tortillas de maiz'), (rid, 'Pollo'), (rid, 'Lechuga'), (rid, 'Tomate'), (rid, 'Aguacate');

  -- 63. Curry de lentejas
  INSERT INTO default_recipes (name, name_en, icon, category, prep_minutes, allergens)
  VALUES ('Curry de lentejas', 'Lentil curry', 'soup', 'Legumbres', 30, '{}')
  RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name)
  VALUES (rid, 'Lentejas'), (rid, 'Leche de coco'), (rid, 'Curry'), (rid, 'Tomate'), (rid, 'Cebolla');

  -- 64. Stir fry de verduras
  INSERT INTO default_recipes (name, name_en, icon, category, prep_minutes, allergens)
  VALUES ('Stir fry de verduras', 'Vegetable stir fry', 'bowl', 'Ensaladas', 15, '{soja}')
  RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name)
  VALUES (rid, 'Brocoli'), (rid, 'Zanahoria'), (rid, 'Pimiento rojo'), (rid, 'Salsa de soja'), (rid, 'Arroz');

  -- 65. Bowl de quinoa
  INSERT INTO default_recipes (name, name_en, icon, category, prep_minutes, allergens)
  VALUES ('Bowl de quinoa', 'Quinoa bowl', 'bowl', 'Ensaladas', 20, '{}')
  RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name)
  VALUES (rid, 'Quinoa'), (rid, 'Aguacate'), (rid, 'Tomate cherry'), (rid, 'Pepino'), (rid, 'Huevo');

  -- 66. Sopa de tomate
  INSERT INTO default_recipes (name, name_en, icon, category, prep_minutes, allergens)
  VALUES ('Sopa de tomate', 'Tomato soup', 'soup', 'Sopas y Cremas', 20, '{}')
  RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name)
  VALUES (rid, 'Tomate'), (rid, 'Cebolla'), (rid, 'Ajo'), (rid, 'Pan');

  -- 67. Tortitas
  INSERT INTO default_recipes (name, name_en, icon, category, prep_minutes, allergens)
  VALUES ('Tortitas', 'Pancakes', 'egg', 'Rapidas', 15, '{gluten,huevo,lacteos}')
  RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name)
  VALUES (rid, 'Harina'), (rid, 'Huevos'), (rid, 'Leche'), (rid, 'Mantequilla');

  -- 68. Revuelto de setas
  INSERT INTO default_recipes (name, name_en, icon, category, prep_minutes, allergens)
  VALUES ('Revuelto de setas', 'Mushroom scramble', 'egg', 'Huevos', 10, '{huevo}')
  RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name)
  VALUES (rid, 'Huevos'), (rid, 'Setas'), (rid, 'Ajo');

  -- 69. Arroz con pollo
  INSERT INTO default_recipes (name, name_en, icon, category, prep_minutes, allergens)
  VALUES ('Arroz con pollo', 'Chicken rice', 'rice', 'Pasta y Arroces', 30, '{}')
  RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name)
  VALUES (rid, 'Arroz'), (rid, 'Pollo'), (rid, 'Pimiento rojo'), (rid, 'Guisantes');

  -- 70. Crema de puerros
  INSERT INTO default_recipes (name, name_en, icon, category, prep_minutes, allergens)
  VALUES ('Crema de puerros', 'Leek cream soup', 'soup', 'Sopas y Cremas', 25, '{lacteos}')
  RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name)
  VALUES (rid, 'Puerros'), (rid, 'Patata'), (rid, 'Nata'), (rid, 'Cebolla');

  -- 71. Ensaladilla rusa
  INSERT INTO default_recipes (name, name_en, icon, category, prep_minutes, allergens)
  VALUES ('Ensaladilla rusa', 'Russian salad', 'salad', 'Ensaladas', 30, '{huevo,pescado}')
  RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name)
  VALUES (rid, 'Patatas'), (rid, 'Zanahoria'), (rid, 'Guisantes'), (rid, 'Atun en lata'), (rid, 'Huevos'), (rid, 'Mayonesa');

  -- 72. Berenjenas rellenas
  INSERT INTO default_recipes (name, name_en, icon, category, prep_minutes, allergens)
  VALUES ('Berenjenas rellenas', 'Stuffed eggplant', 'bowl', 'Ensaladas', 35, '{lacteos}')
  RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name)
  VALUES (rid, 'Berenjena'), (rid, 'Carne picada'), (rid, 'Tomate frito'), (rid, 'Queso');

  -- 73. Sopa minestrone
  INSERT INTO default_recipes (name, name_en, icon, category, prep_minutes, allergens)
  VALUES ('Sopa minestrone', 'Minestrone soup', 'soup', 'Sopas y Cremas', 30, '{gluten}')
  RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name)
  VALUES (rid, 'Pasta'), (rid, 'Judias verdes'), (rid, 'Zanahoria'), (rid, 'Tomate'), (rid, 'Patata');

  -- 74. Pollo teriyaki
  INSERT INTO default_recipes (name, name_en, icon, category, prep_minutes, allergens)
  VALUES ('Pollo teriyaki', 'Teriyaki chicken', 'chicken', 'Carnes', 20, '{soja}')
  RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name)
  VALUES (rid, 'Pollo'), (rid, 'Salsa de soja'), (rid, 'Arroz'), (rid, 'Brocoli');

  -- 75. Wrap de atun
  INSERT INTO default_recipes (name, name_en, icon, category, prep_minutes, allergens)
  VALUES ('Wrap de atun', 'Tuna wrap', 'wrap', 'Pescados', 10, '{gluten,pescado}')
  RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name)
  VALUES (rid, 'Tortillas de trigo'), (rid, 'Atun en lata'), (rid, 'Lechuga'), (rid, 'Tomate'), (rid, 'Mayonesa');

END $$;
