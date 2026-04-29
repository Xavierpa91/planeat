export interface Household {
  id: string
  name: string
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

export interface MenuSlot {
  id: string
  menu_id: string
  day_of_week: number // 0=lun, 6=dom
  meal_type: 'lunch' | 'dinner'
  recipe_id: string | null
  custom_meal: string | null
  recipe?: Recipe
}

export const DAYS = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'] as const

export const MEAL_TYPES = {
  lunch: 'Comida',
  dinner: 'Cena',
} as const
