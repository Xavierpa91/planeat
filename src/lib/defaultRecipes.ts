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
