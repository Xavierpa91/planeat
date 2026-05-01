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

      // Fetch extra recipes for all slots
      if (slotsData && slotsData.length > 0) {
        const slotIds = slotsData.map(s => s.id)
        const { data: extraData } = await supabase
          .from('menu_slot_recipes')
          .select('*, recipe:recipes(*, ingredients:recipe_ingredients(*))')
          .in('slot_id', slotIds)
          .order('position')

        // Attach extras to their slots
        const extrasMap = new Map<string, typeof extraData>()
        for (const extra of (extraData ?? [])) {
          const list = extrasMap.get(extra.slot_id) ?? []
          list.push(extra)
          extrasMap.set(extra.slot_id, list)
        }

        const enrichedSlots = slotsData.map(s => ({
          ...s,
          extra_recipes: extrasMap.get(s.id) ?? [],
        }))

        setSlots(enrichedSlots)
      } else {
        setSlots(slotsData ?? [])
      }
    }

    setLoading(false)
  }, [householdId, weekStr])

  useEffect(() => {
    fetchMenu()
  }, [fetchMenu])

  const setSlot = async (dayOfWeek: number, mealType: MealType, recipeId: string | null, customMeal: string | null) => {
    if (!menu) return

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

  // Add an extra recipe to an existing slot
  const addExtraRecipe = async (dayOfWeek: number, mealType: MealType, recipeId: string) => {
    if (!menu) return

    let slot = slots.find(s => s.day_of_week === dayOfWeek && s.meal_type === mealType)

    // If no slot exists yet, create one with the recipe as primary
    if (!slot) {
      await setSlot(dayOfWeek, mealType, recipeId, null)
      return
    }

    // If slot has no primary recipe, set it as primary
    if (!slot.recipe_id) {
      await supabase
        .from('menu_slots')
        .update({ recipe_id: recipeId })
        .eq('id', slot.id)
      await fetchMenu()
      return
    }

    // Add as extra recipe
    const position = (slot.extra_recipes?.length ?? 0) + 1
    await supabase
      .from('menu_slot_recipes')
      .insert({ slot_id: slot.id, recipe_id: recipeId, position })

    await fetchMenu()
  }

  // Remove an extra recipe from a slot
  const removeExtraRecipe = async (extraId: string) => {
    await supabase.from('menu_slot_recipes').delete().eq('id', extraId)
    await fetchMenu()
  }

  const clearSlot = async (dayOfWeek: number, mealType: MealType) => {
    const existing = slots.find(s => s.day_of_week === dayOfWeek && s.meal_type === mealType)
    if (existing) {
      // Delete extras first (cascade should handle it, but be safe)
      await supabase.from('menu_slot_recipes').delete().eq('slot_id', existing.id)
      await supabase.from('menu_slots').delete().eq('id', existing.id)
      await fetchMenu()
    }
  }

  const copyMenuToWeek = async (targetWeekStart: Date) => {
    if (!menu || !householdId) return

    const targetStr = formatDate(targetWeekStart)

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
      const { data: newSlots } = await supabase.from('menu_slots').insert(
        slots.map(s => ({
          menu_id: targetMenu.id,
          day_of_week: s.day_of_week,
          meal_type: s.meal_type,
          recipe_id: s.recipe_id,
          custom_meal: s.custom_meal,
        }))
      ).select()

      // Copy extra recipes
      if (newSlots) {
        const extraInserts = []
        for (let i = 0; i < slots.length; i++) {
          const extras = slots[i].extra_recipes ?? []
          for (const extra of extras) {
            extraInserts.push({
              slot_id: newSlots[i].id,
              recipe_id: extra.recipe_id,
              position: extra.position,
            })
          }
        }
        if (extraInserts.length > 0) {
          await supabase.from('menu_slot_recipes').insert(extraInserts)
        }
      }
    }
  }

  // Get all ingredients from the week's menu (including extras)
  const getWeekIngredients = (): string[] => {
    const ingredients: string[] = []
    for (const slot of slots) {
      if (slot.recipe?.ingredients) {
        for (const ing of slot.recipe.ingredients) {
          ingredients.push(ing.name)
        }
      }
      // Include extra recipes' ingredients
      if (slot.extra_recipes) {
        for (const extra of slot.extra_recipes) {
          if (extra.recipe?.ingredients) {
            for (const ing of extra.recipe.ingredients) {
              ingredients.push(ing.name)
            }
          }
        }
      }
    }
    return [...new Set(ingredients.map(i => i.trim().toLowerCase()))]
      .map(i => i.charAt(0).toUpperCase() + i.slice(1))
      .sort()
  }

  const clearWeek = async () => {
    if (!menu) return
    await supabase.from('menu_slot_recipes').delete().in('slot_id', slots.map(s => s.id))
    await supabase.from('menu_slots').delete().eq('menu_id', menu.id)
    await fetchMenu()
  }

  return {
    menu, slots, loading,
    setSlot, clearSlot, addExtraRecipe, removeExtraRecipe,
    copyMenuToWeek, clearWeek, getWeekIngredients, refetch: fetchMenu,
  }
}
