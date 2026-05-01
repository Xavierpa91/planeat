export interface Household {
  id: string
  name: string
  invite_code?: string
  created_at: string
}

export interface HouseholdMember {
  household_id: string
  user_id: string
  role: 'admin' | 'member'
}

export interface Recipe {
  id: string
  household_id: string
  name: string
  name_en?: string
  icon?: string
  category?: string
  prep_minutes?: number
  allergens?: string[]
  is_default?: boolean
  created_at: string
  ingredients?: RecipeIngredient[]
}

export interface RecipeIngredient {
  id: string
  recipe_id: string
  name: string
}

export interface WeeklyMenu {
  id: string
  household_id: string
  week_start: string
  created_at: string
}

export type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner'

export interface MenuSlotRecipe {
  id: string
  slot_id: string
  recipe_id: string
  position: number
  recipe?: Recipe
}

export interface MenuSlot {
  id: string
  menu_id: string
  day_of_week: number // 0=lun, 6=dom
  meal_type: MealType
  recipe_id: string | null
  custom_meal: string | null
  recipe?: Recipe
  extra_recipes?: MenuSlotRecipe[]
}

export const DAYS = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'] as const

export const ALL_MEAL_TYPES: Record<MealType, string> = {
  breakfast: 'Desayuno',
  lunch: 'Comida',
  snack: 'Merienda',
  dinner: 'Cena',
}

export const DEFAULT_MEAL_TYPES: MealType[] = ['lunch', 'dinner']
