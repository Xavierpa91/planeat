-- Fix recipe icons that don't match their category
-- Run in Supabase SQL Editor

-- Carnes: should use 'chicken' icon
UPDATE default_recipes SET icon = 'chicken' WHERE name = 'Filetes de ternera' AND icon != 'chicken';
UPDATE default_recipes SET icon = 'chicken' WHERE name = 'Lomo a la sal' AND icon != 'chicken';

-- Legumbres/Sopas: 'soup' is correct for stews
-- Albondigas: bowl is ok (it's served in a bowl with sauce)

-- Croquetas de jamon: should be 'bowl' (fried, not wrap)
UPDATE default_recipes SET icon = 'bowl' WHERE name = 'Croquetas de jamon';

-- Empanada gallega: 'wrap' works (wrapped dough)

-- Patatas bravas: bowl works
-- Pisto: bowl works

-- Pollo teriyaki: should be 'chicken'
UPDATE default_recipes SET icon = 'chicken' WHERE name = 'Pollo teriyaki';

-- Arroz con pollo: should be 'rice'
UPDATE default_recipes SET icon = 'rice' WHERE name = 'Arroz con pollo';
