-- PlanEat: Default Recipes Migration
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Table for default/shared recipes (not household-scoped)
CREATE TABLE default_recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  icon text,
  category text,
  created_at timestamptz DEFAULT now()
);

-- Ingredients for default recipes
CREATE TABLE default_recipe_ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid REFERENCES default_recipes(id) ON DELETE CASCADE,
  name text NOT NULL
);

-- RLS: all authenticated users can read, no one can write from client
ALTER TABLE default_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE default_recipe_ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "default_recipes_select" ON default_recipes FOR SELECT USING (true);
CREATE POLICY "default_ingredients_select" ON default_recipe_ingredients FOR SELECT USING (true);

-- Seed: 45 Spanish default recipes
DO $$
DECLARE
  rid uuid;
BEGIN

  -- 1. Macarrones con tomate
  INSERT INTO default_recipes (name, icon, category) VALUES ('Macarrones con tomate', 'pasta', 'Pasta y Arroces') RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name) VALUES (rid, 'Macarrones'), (rid, 'Tomate frito'), (rid, 'Queso rallado');

  -- 2. Tortilla de patatas
  INSERT INTO default_recipes (name, icon, category) VALUES ('Tortilla de patatas', 'egg', 'Huevos') RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name) VALUES (rid, 'Huevos'), (rid, 'Patatas'), (rid, 'Cebolla');

  -- 3. Pollo al horno
  INSERT INTO default_recipes (name, icon, category) VALUES ('Pollo al horno', 'chicken', 'Carnes') RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name) VALUES (rid, 'Pollo'), (rid, 'Limon'), (rid, 'Ajo');

  -- 4. Ensalada Cesar
  INSERT INTO default_recipes (name, icon, category) VALUES ('Ensalada Cesar', 'salad', 'Ensaladas') RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name) VALUES (rid, 'Lechuga'), (rid, 'Pollo'), (rid, 'Queso parmesano'), (rid, 'Pan tostado');

  -- 5. Arroz con verduras
  INSERT INTO default_recipes (name, icon, category) VALUES ('Arroz con verduras', 'rice', 'Pasta y Arroces') RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name) VALUES (rid, 'Arroz'), (rid, 'Pimiento rojo'), (rid, 'Calabacin'), (rid, 'Zanahoria');

  -- 6. Lentejas
  INSERT INTO default_recipes (name, icon, category) VALUES ('Lentejas', 'soup', 'Legumbres') RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name) VALUES (rid, 'Lentejas'), (rid, 'Zanahoria'), (rid, 'Patata'), (rid, 'Chorizo');

  -- 7. Pizza casera
  INSERT INTO default_recipes (name, icon, category) VALUES ('Pizza casera', 'pizza', 'Pasta y Arroces') RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name) VALUES (rid, 'Harina'), (rid, 'Tomate frito'), (rid, 'Queso rallado'), (rid, 'Jamon');

  -- 8. Salmon a la plancha
  INSERT INTO default_recipes (name, icon, category) VALUES ('Salmon a la plancha', 'fish', 'Pescados') RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name) VALUES (rid, 'Salmon'), (rid, 'Limon'), (rid, 'Espinacas');

  -- 9. Espaguetis carbonara
  INSERT INTO default_recipes (name, icon, category) VALUES ('Espaguetis carbonara', 'pasta', 'Pasta y Arroces') RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name) VALUES (rid, 'Espaguetis'), (rid, 'Bacon'), (rid, 'Huevos'), (rid, 'Queso parmesano'), (rid, 'Nata');

  -- 10. Wrap de pollo
  INSERT INTO default_recipes (name, icon, category) VALUES ('Wrap de pollo', 'wrap', 'Carnes') RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name) VALUES (rid, 'Tortillas de trigo'), (rid, 'Pollo'), (rid, 'Lechuga'), (rid, 'Tomate');

  -- 11. Poke bowl
  INSERT INTO default_recipes (name, icon, category) VALUES ('Poke bowl', 'bowl', 'Pescados') RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name) VALUES (rid, 'Arroz'), (rid, 'Salmon'), (rid, 'Aguacate'), (rid, 'Pepino'), (rid, 'Salsa de soja');

  -- 12. Garbanzos con espinacas
  INSERT INTO default_recipes (name, icon, category) VALUES ('Garbanzos con espinacas', 'bowl', 'Legumbres') RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name) VALUES (rid, 'Garbanzos'), (rid, 'Espinacas'), (rid, 'Ajo'), (rid, 'Pimenton');

  -- 13. Pollo a la plancha
  INSERT INTO default_recipes (name, icon, category) VALUES ('Pollo a la plancha', 'chicken', 'Carnes') RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name) VALUES (rid, 'Pechuga de pollo'), (rid, 'Limon');

  -- 14. Filetes de ternera
  INSERT INTO default_recipes (name, icon, category) VALUES ('Filetes de ternera', 'chicken', 'Carnes') RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name) VALUES (rid, 'Filetes de ternera'), (rid, 'Ajo');

  -- 15. Albondigas en salsa
  INSERT INTO default_recipes (name, icon, category) VALUES ('Albondigas en salsa', 'bowl', 'Carnes') RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name) VALUES (rid, 'Carne picada'), (rid, 'Tomate frito'), (rid, 'Cebolla'), (rid, 'Pan rallado');

  -- 16. Pollo al curry
  INSERT INTO default_recipes (name, icon, category) VALUES ('Pollo al curry', 'chicken', 'Carnes') RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name) VALUES (rid, 'Pollo'), (rid, 'Leche de coco'), (rid, 'Curry'), (rid, 'Arroz');

  -- 17. Hamburguesas caseras
  INSERT INTO default_recipes (name, icon, category) VALUES ('Hamburguesas caseras', 'wrap', 'Carnes') RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name) VALUES (rid, 'Carne picada'), (rid, 'Pan de hamburguesa'), (rid, 'Lechuga'), (rid, 'Tomate'), (rid, 'Queso');

  -- 18. Lomo a la sal
  INSERT INTO default_recipes (name, icon, category) VALUES ('Lomo a la sal', 'chicken', 'Carnes') RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name) VALUES (rid, 'Lomo de cerdo'), (rid, 'Patatas');

  -- 19. Merluza en salsa verde
  INSERT INTO default_recipes (name, icon, category) VALUES ('Merluza en salsa verde', 'fish', 'Pescados') RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name) VALUES (rid, 'Merluza'), (rid, 'Ajo'), (rid, 'Perejil'), (rid, 'Guisantes');

  -- 20. Gambas al ajillo
  INSERT INTO default_recipes (name, icon, category) VALUES ('Gambas al ajillo', 'fish', 'Pescados') RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name) VALUES (rid, 'Gambas'), (rid, 'Ajo'), (rid, 'Guindilla');

  -- 21. Bacalao al pil pil
  INSERT INTO default_recipes (name, icon, category) VALUES ('Bacalao al pil pil', 'fish', 'Pescados') RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name) VALUES (rid, 'Bacalao'), (rid, 'Ajo');

  -- 22. Atun a la plancha
  INSERT INTO default_recipes (name, icon, category) VALUES ('Atun a la plancha', 'fish', 'Pescados') RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name) VALUES (rid, 'Atun fresco'), (rid, 'Limon');

  -- 23. Calamares a la romana
  INSERT INTO default_recipes (name, icon, category) VALUES ('Calamares a la romana', 'fish', 'Pescados') RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name) VALUES (rid, 'Calamares'), (rid, 'Harina'), (rid, 'Limon');

  -- 24. Alubias con chorizo
  INSERT INTO default_recipes (name, icon, category) VALUES ('Alubias con chorizo', 'soup', 'Legumbres') RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name) VALUES (rid, 'Alubias'), (rid, 'Chorizo'), (rid, 'Pimiento verde'), (rid, 'Cebolla');

  -- 25. Potaje de garbanzos
  INSERT INTO default_recipes (name, icon, category) VALUES ('Potaje de garbanzos', 'soup', 'Legumbres') RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name) VALUES (rid, 'Garbanzos'), (rid, 'Espinacas'), (rid, 'Bacalao'), (rid, 'Tomate');

  -- 26. Fabada asturiana
  INSERT INTO default_recipes (name, icon, category) VALUES ('Fabada asturiana', 'soup', 'Legumbres') RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name) VALUES (rid, 'Fabes'), (rid, 'Chorizo'), (rid, 'Morcilla'), (rid, 'Lacon');

  -- 27. Ensalada de lentejas
  INSERT INTO default_recipes (name, icon, category) VALUES ('Ensalada de lentejas', 'salad', 'Ensaladas') RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name) VALUES (rid, 'Lentejas'), (rid, 'Tomate'), (rid, 'Cebolla'), (rid, 'Pimiento rojo'), (rid, 'Pepino');

  -- 28. Arroz a la cubana
  INSERT INTO default_recipes (name, icon, category) VALUES ('Arroz a la cubana', 'rice', 'Pasta y Arroces') RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name) VALUES (rid, 'Arroz'), (rid, 'Tomate frito'), (rid, 'Huevos'), (rid, 'Platano');

  -- 29. Paella de verduras
  INSERT INTO default_recipes (name, icon, category) VALUES ('Paella de verduras', 'rice', 'Pasta y Arroces') RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name) VALUES (rid, 'Arroz'), (rid, 'Judias verdes'), (rid, 'Alcachofa'), (rid, 'Pimiento rojo'), (rid, 'Tomate');

  -- 30. Fideua
  INSERT INTO default_recipes (name, icon, category) VALUES ('Fideua', 'pasta', 'Pasta y Arroces') RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name) VALUES (rid, 'Fideos'), (rid, 'Gambas'), (rid, 'Calamar'), (rid, 'Pimiento rojo');

  -- 31. Pasta al pesto
  INSERT INTO default_recipes (name, icon, category) VALUES ('Pasta al pesto', 'pasta', 'Pasta y Arroces') RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name) VALUES (rid, 'Espaguetis'), (rid, 'Albahaca'), (rid, 'Pinones'), (rid, 'Queso parmesano');

  -- 32. Risotto de champinones
  INSERT INTO default_recipes (name, icon, category) VALUES ('Risotto de champinones', 'rice', 'Pasta y Arroces') RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name) VALUES (rid, 'Arroz'), (rid, 'Champinones'), (rid, 'Cebolla'), (rid, 'Queso parmesano');

  -- 33. Ensalada mixta
  INSERT INTO default_recipes (name, icon, category) VALUES ('Ensalada mixta', 'salad', 'Ensaladas') RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name) VALUES (rid, 'Lechuga'), (rid, 'Tomate'), (rid, 'Cebolla'), (rid, 'Atun en lata'), (rid, 'Aceitunas');

  -- 34. Gazpacho
  INSERT INTO default_recipes (name, icon, category) VALUES ('Gazpacho', 'soup', 'Ensaladas') RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name) VALUES (rid, 'Tomate'), (rid, 'Pimiento verde'), (rid, 'Pepino'), (rid, 'Ajo'), (rid, 'Pan');

  -- 35. Ensalada de pasta
  INSERT INTO default_recipes (name, icon, category) VALUES ('Ensalada de pasta', 'salad', 'Ensaladas') RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name) VALUES (rid, 'Pasta'), (rid, 'Tomate cherry'), (rid, 'Aceitunas'), (rid, 'Atun en lata'), (rid, 'Maiz');

  -- 36. Hummus con crudites
  INSERT INTO default_recipes (name, icon, category) VALUES ('Hummus con crudites', 'bowl', 'Ensaladas') RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name) VALUES (rid, 'Garbanzos'), (rid, 'Zanahoria'), (rid, 'Pepino'), (rid, 'Pimiento rojo');

  -- 37. Huevos revueltos
  INSERT INTO default_recipes (name, icon, category) VALUES ('Huevos revueltos', 'egg', 'Huevos') RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name) VALUES (rid, 'Huevos'), (rid, 'Jamon');

  -- 38. Huevos rotos con jamon
  INSERT INTO default_recipes (name, icon, category) VALUES ('Huevos rotos con jamon', 'egg', 'Huevos') RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name) VALUES (rid, 'Huevos'), (rid, 'Patatas'), (rid, 'Jamon');

  -- 39. Revuelto de esparragos
  INSERT INTO default_recipes (name, icon, category) VALUES ('Revuelto de esparragos', 'egg', 'Huevos') RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name) VALUES (rid, 'Huevos'), (rid, 'Esparragos');

  -- 40. Tortilla francesa
  INSERT INTO default_recipes (name, icon, category) VALUES ('Tortilla francesa', 'egg', 'Huevos') RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name) VALUES (rid, 'Huevos'), (rid, 'Queso rallado');

  -- 41. Crema de calabacin
  INSERT INTO default_recipes (name, icon, category) VALUES ('Crema de calabacin', 'soup', 'Sopas y Cremas') RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name) VALUES (rid, 'Calabacin'), (rid, 'Patata'), (rid, 'Cebolla'), (rid, 'Quesitos');

  -- 42. Crema de zanahoria
  INSERT INTO default_recipes (name, icon, category) VALUES ('Crema de zanahoria', 'soup', 'Sopas y Cremas') RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name) VALUES (rid, 'Zanahoria'), (rid, 'Patata'), (rid, 'Cebolla');

  -- 43. Sopa de fideos
  INSERT INTO default_recipes (name, icon, category) VALUES ('Sopa de fideos', 'soup', 'Sopas y Cremas') RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name) VALUES (rid, 'Fideos'), (rid, 'Zanahoria'), (rid, 'Pollo');

  -- 44. Crema de calabaza
  INSERT INTO default_recipes (name, icon, category) VALUES ('Crema de calabaza', 'soup', 'Sopas y Cremas') RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name) VALUES (rid, 'Calabaza'), (rid, 'Patata'), (rid, 'Cebolla');

  -- 45. Sopa de cebolla
  INSERT INTO default_recipes (name, icon, category) VALUES ('Sopa de cebolla', 'soup', 'Sopas y Cremas') RETURNING id INTO rid;
  INSERT INTO default_recipe_ingredients (recipe_id, name) VALUES (rid, 'Cebolla'), (rid, 'Pan'), (rid, 'Queso rallado');

END $$;
