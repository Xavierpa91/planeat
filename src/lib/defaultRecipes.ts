import type { Recipe, RecipeIngredient } from '../types'

interface DefaultRecipeData {
  name: string
  icon: string
  ingredients: string[]
}

const DEFAULT_RECIPE_DATA: DefaultRecipeData[] = [
  {
    name: 'Macarrones con tomate',
    icon: 'pasta',
    ingredients: ['Macarrones', 'Tomate frito', 'Queso rallado'],
  },
  {
    name: 'Tortilla de patatas',
    icon: 'egg',
    ingredients: ['Huevos', 'Patatas', 'Cebolla'],
  },
  {
    name: 'Pollo al horno',
    icon: 'chicken',
    ingredients: ['Pollo', 'Limon', 'Ajo'],
  },
  {
    name: 'Ensalada Cesar',
    icon: 'salad',
    ingredients: ['Lechuga', 'Pollo', 'Queso parmesano', 'Pan tostado'],
  },
  {
    name: 'Arroz con verduras',
    icon: 'rice',
    ingredients: ['Arroz', 'Pimiento rojo', 'Calabacin', 'Zanahoria'],
  },
  {
    name: 'Lentejas',
    icon: 'soup',
    ingredients: ['Lentejas', 'Zanahoria', 'Patata', 'Chorizo'],
  },
  {
    name: 'Pizza casera',
    icon: 'pizza',
    ingredients: ['Harina', 'Tomate frito', 'Queso rallado', 'Jamon'],
  },
  {
    name: 'Salmon a la plancha',
    icon: 'fish',
    ingredients: ['Salmon', 'Limon', 'Espinacas'],
  },
  {
    name: 'Espaguetis carbonara',
    icon: 'pasta',
    ingredients: ['Espaguetis', 'Bacon', 'Huevos', 'Queso parmesano', 'Nata'],
  },
  {
    name: 'Wrap de pollo',
    icon: 'wrap',
    ingredients: ['Tortillas de trigo', 'Pollo', 'Lechuga', 'Tomate'],
  },
  {
    name: 'Poke bowl',
    icon: 'bowl',
    ingredients: ['Arroz', 'Salmon', 'Aguacate', 'Pepino', 'Salsa de soja'],
  },
  {
    name: 'Garbanzos con espinacas',
    icon: 'bowl',
    ingredients: ['Garbanzos', 'Espinacas', 'Ajo', 'Pimenton'],
  },

  // --- Carnes ---
  {
    name: 'Pollo a la plancha',
    icon: 'chicken',
    ingredients: ['Pechuga de pollo', 'Limon'],
  },
  {
    name: 'Filetes de ternera',
    icon: 'chicken',
    ingredients: ['Filetes de ternera', 'Ajo'],
  },
  {
    name: 'Albondigas en salsa',
    icon: 'bowl',
    ingredients: ['Carne picada', 'Tomate frito', 'Cebolla', 'Pan rallado'],
  },
  {
    name: 'Pollo al curry',
    icon: 'chicken',
    ingredients: ['Pollo', 'Leche de coco', 'Curry', 'Arroz'],
  },
  {
    name: 'Hamburguesas caseras',
    icon: 'wrap',
    ingredients: ['Carne picada', 'Pan de hamburguesa', 'Lechuga', 'Tomate', 'Queso'],
  },
  {
    name: 'Lomo a la sal',
    icon: 'chicken',
    ingredients: ['Lomo de cerdo', 'Patatas'],
  },

  // --- Pescados ---
  {
    name: 'Merluza en salsa verde',
    icon: 'fish',
    ingredients: ['Merluza', 'Ajo', 'Perejil', 'Guisantes'],
  },
  {
    name: 'Gambas al ajillo',
    icon: 'fish',
    ingredients: ['Gambas', 'Ajo', 'Guindilla'],
  },
  {
    name: 'Bacalao al pil pil',
    icon: 'fish',
    ingredients: ['Bacalao', 'Ajo'],
  },
  {
    name: 'Atun a la plancha',
    icon: 'fish',
    ingredients: ['Atun fresco', 'Limon'],
  },
  {
    name: 'Calamares a la romana',
    icon: 'fish',
    ingredients: ['Calamares', 'Harina', 'Limon'],
  },

  // --- Legumbres ---
  {
    name: 'Alubias con chorizo',
    icon: 'soup',
    ingredients: ['Alubias', 'Chorizo', 'Pimiento verde', 'Cebolla'],
  },
  {
    name: 'Potaje de garbanzos',
    icon: 'soup',
    ingredients: ['Garbanzos', 'Espinacas', 'Bacalao', 'Tomate'],
  },
  {
    name: 'Fabada asturiana',
    icon: 'soup',
    ingredients: ['Fabes', 'Chorizo', 'Morcilla', 'Lacon'],
  },
  {
    name: 'Ensalada de lentejas',
    icon: 'salad',
    ingredients: ['Lentejas', 'Tomate', 'Cebolla', 'Pimiento rojo', 'Pepino'],
  },

  // --- Pasta y Arroces ---
  {
    name: 'Arroz a la cubana',
    icon: 'rice',
    ingredients: ['Arroz', 'Tomate frito', 'Huevos', 'Platano'],
  },
  {
    name: 'Paella de verduras',
    icon: 'rice',
    ingredients: ['Arroz', 'Judias verdes', 'Alcachofa', 'Pimiento rojo', 'Tomate'],
  },
  {
    name: 'Fideua',
    icon: 'pasta',
    ingredients: ['Fideos', 'Gambas', 'Calamar', 'Pimiento rojo'],
  },
  {
    name: 'Pasta al pesto',
    icon: 'pasta',
    ingredients: ['Espaguetis', 'Albahaca', 'Pinones', 'Queso parmesano'],
  },
  {
    name: 'Risotto de champinones',
    icon: 'rice',
    ingredients: ['Arroz', 'Champinones', 'Cebolla', 'Queso parmesano'],
  },

  // --- Ensaladas y Ligeros ---
  {
    name: 'Ensalada mixta',
    icon: 'salad',
    ingredients: ['Lechuga', 'Tomate', 'Cebolla', 'Atun en lata', 'Aceitunas'],
  },
  {
    name: 'Gazpacho',
    icon: 'soup',
    ingredients: ['Tomate', 'Pimiento verde', 'Pepino', 'Ajo', 'Pan'],
  },
  {
    name: 'Ensalada de pasta',
    icon: 'salad',
    ingredients: ['Pasta', 'Tomate cherry', 'Aceitunas', 'Atun en lata', 'Maiz'],
  },
  {
    name: 'Hummus con crudites',
    icon: 'bowl',
    ingredients: ['Garbanzos', 'Zanahoria', 'Pepino', 'Pimiento rojo'],
  },

  // --- Huevos ---
  {
    name: 'Huevos revueltos',
    icon: 'egg',
    ingredients: ['Huevos', 'Jamon'],
  },
  {
    name: 'Huevos rotos con jamon',
    icon: 'egg',
    ingredients: ['Huevos', 'Patatas', 'Jamon'],
  },
  {
    name: 'Revuelto de esparragos',
    icon: 'egg',
    ingredients: ['Huevos', 'Esparragos'],
  },
  {
    name: 'Tortilla francesa',
    icon: 'egg',
    ingredients: ['Huevos', 'Queso rallado'],
  },

  // --- Sopas y Cremas ---
  {
    name: 'Crema de calabacin',
    icon: 'soup',
    ingredients: ['Calabacin', 'Patata', 'Cebolla', 'Quesitos'],
  },
  {
    name: 'Crema de zanahoria',
    icon: 'soup',
    ingredients: ['Zanahoria', 'Patata', 'Cebolla'],
  },
  {
    name: 'Sopa de fideos',
    icon: 'soup',
    ingredients: ['Fideos', 'Zanahoria', 'Pollo'],
  },
  {
    name: 'Crema de calabaza',
    icon: 'soup',
    ingredients: ['Calabaza', 'Patata', 'Cebolla'],
  },
  {
    name: 'Sopa de cebolla',
    icon: 'soup',
    ingredients: ['Cebolla', 'Pan', 'Queso rallado'],
  },
]

let _defaultRecipes: Recipe[] | null = null

export function getDefaultRecipes(): Recipe[] {
  if (_defaultRecipes) return _defaultRecipes

  _defaultRecipes = DEFAULT_RECIPE_DATA.map((data, index) => {
    const id = `default-${index}`
    const ingredients: RecipeIngredient[] = data.ingredients.map((name, i) => ({
      id: `${id}-ing-${i}`,
      recipe_id: id,
      name,
    }))

    return {
      id,
      household_id: '__default__',
      name: data.name,
      icon: data.icon,
      is_default: true,
      created_at: new Date().toISOString(),
      ingredients,
    }
  })

  return _defaultRecipes
}
