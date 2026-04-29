import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { formatDate } from '../lib/week'
import type { WeeklyMenu, MenuSlot, MealType } from '../types'

export function useMenu(householdId: string | undefined, weekStart: Date) {
  const [menu, setMenu] = useState<WeeklyMenu | null>(null)
  const [slots, setSlots] = useState<MenuSlot[]>([])
  const [loading, setLoading] = useState(true)

  const weekStr = formatDate(weekStart)

  const fetchMenu = useCallback(async () => {
    if (!householdId) return
    setLoading(true)

    let { data: existingMenu } = await supabase
      .from('weekly_menus')
      .select('*')
      .eq('household_id', householdId)
      .eq('week_start', weekStr)
      .single()

    if (!existingMenu) {
      // Auto-create menu for this week
      const { data: newMenu } = await supabase
        .from('weekly_menus')
        .insert({ household_id: householdId, week_start: weekStr })
        .select()
        .single()
      existingMenu = newMenu
    }

    if (existingMenu) {
      setMenu(existingMenu)

      const { data: slotsData } = await supabase
        .from('menu_slots')
        .select('*, recipe:recipes(*, ingredients:recipe_ingredients(*))')
        .eq('menu_id', existingMenu.id)
        .order('day_of_week')

      setSlots(slotsData ?? [])
    }

    setLoading(false)
  }, [householdId, weekStr])

  useEffect(() => {
    fetchMenu()
  }, [fetchMenu])

  const setSlot = async (dayOfWeek: number, mealType: MealType, recipeId: string | null, customMeal: string | null) => {
    if (!menu) return

    // Check if slot exists
    const existing = slots.find(s => s.day_of_week === dayOfWeek && s.meal_type === mealType)

    if (existing) {
      await supabase
        .from('menu_slots')
        .update({ recipe_id: recipeId, custom_meal: customMeal })
        .eq('id', existing.id)
    } else {
      await supabase
        .from('menu_slots')
        .insert({
          menu_id: menu.id,
          day_of_week: dayOfWeek,
          meal_type: mealType,
          recipe_id: recipeId,
          custom_meal: customMeal,
        })
    }

    await fetchMenu()
  }

  const clearSlot = async (dayOfWeek: number, mealType: MealType) => {
    const existing = slots.find(s => s.day_of_week === dayOfWeek && s.meal_type === mealType)
    if (existing) {
      await supabase.from('menu_slots').delete().eq('id', existing.id)
      await fetchMenu()
    }
  }

  const copyMenuToWeek = async (targetWeekStart: Date) => {
    if (!menu || !householdId) return

    const targetStr = formatDate(targetWeekStart)

    // Create target menu
    let { data: targetMenu } = await supabase
      .from('weekly_menus')
      .select('*')
      .eq('household_id', householdId)
      .eq('week_start', targetStr)
      .single()

    if (!targetMenu) {
      const { data } = await supabase
        .from('weekly_menus')
        .insert({ household_id: householdId, week_start: targetStr })
        .select()
        .single()
      targetMenu = data
    }

    if (!targetMenu) return

    // Clear existing slots in target
    await supabase.from('menu_slots').delete().eq('menu_id', targetMenu.id)

    // Copy slots
    if (slots.length > 0) {
      await supabase.from('menu_slots').insert(
        slots.map(s => ({
          menu_id: targetMenu.id,
          day_of_week: s.day_of_week,
          meal_type: s.meal_type,
          recipe_id: s.recipe_id,
          custom_meal: s.custom_meal,
        }))
      )
    }
  }

  // Get all ingredients from the week's menu
  const getWeekIngredients = (): string[] => {
    const ingredients: string[] = []
    for (const slot of slots) {
      if (slot.recipe?.ingredients) {
        for (const ing of slot.recipe.ingredients) {
          ingredients.push(ing.name)
        }
      }
    }
    return [...new Set(ingredients.map(i => i.trim().toLowerCase()))]
      .map(i => i.charAt(0).toUpperCase() + i.slice(1))
      .sort()
  }

  return { menu, slots, loading, setSlot, clearSlot, copyMenuToWeek, getWeekIngredients, refetch: fetchMenu }
}
