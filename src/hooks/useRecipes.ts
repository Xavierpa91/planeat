import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Recipe } from '../types'

export function useRecipes(householdId: string | undefined) {
  const [userRecipes, setUserRecipes] = useState<Recipe[]>([])
  const [defaultRecipes, setDefaultRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRecipes = useCallback(async () => {
    if (!householdId) return
    setLoading(true)

    // Fetch user recipes and default recipes in parallel
    const [userResult, defaultResult] = await Promise.all([
      supabase
        .from('recipes')
        .select('*, ingredients:recipe_ingredients(*)')
        .eq('household_id', householdId)
        .order('name'),
      supabase
        .from('default_recipes')
        .select('*, ingredients:default_recipe_ingredients(*)')
        .order('name'),
    ])

    setUserRecipes(userResult.data ?? [])

    // Map default recipes to match Recipe type
    setDefaultRecipes(
      (defaultResult.data ?? []).map(r => ({
        id: r.id,
        household_id: '__default__',
        name: r.name,
        name_en: r.name_en,
        icon: r.icon,
        category: r.category,
        prep_minutes: r.prep_minutes,
        allergens: r.allergens ?? [],
        is_default: true,
        created_at: r.created_at,
        ingredients: r.ingredients,
      }))
    )

    setLoading(false)
  }, [householdId])

  useEffect(() => {
    fetchRecipes()
  }, [fetchRecipes])

  const recipes = [...userRecipes, ...defaultRecipes]

  const addRecipe = async (name: string, ingredients: string[], icon?: string) => {
    if (!householdId) return

    const insertData: Record<string, string> = { name, household_id: householdId }
    if (icon) insertData.icon = icon

    const { data: recipe, error } = await supabase
      .from('recipes')
      .insert(insertData)
      .select()
      .single()

    if (error) throw error

    if (ingredients.length > 0) {
      await supabase
        .from('recipe_ingredients')
        .insert(ingredients.map(ing => ({ recipe_id: recipe.id, name: ing })))
    }

    await fetchRecipes()
    return recipe
  }

  const updateRecipe = async (id: string, name: string, ingredients: string[], icon?: string) => {
    const updateData: Record<string, string | null> = { name }
    updateData.icon = icon ?? null

    await supabase.from('recipes').update(updateData).eq('id', id)

    // Replace all ingredients
    await supabase.from('recipe_ingredients').delete().eq('recipe_id', id)

    if (ingredients.length > 0) {
      await supabase
        .from('recipe_ingredients')
        .insert(ingredients.map(ing => ({ recipe_id: id, name: ing })))
    }

    await fetchRecipes()
  }

  const deleteRecipe = async (id: string) => {
    await supabase.from('recipe_ingredients').delete().eq('recipe_id', id)
    await supabase.from('recipes').delete().eq('id', id)
    await fetchRecipes()
  }

  // Copy a default recipe to user's DB and return the real ID
  const materializeDefaultRecipe = async (defaultRecipeId: string): Promise<string | null> => {
    if (!householdId) return null

    const defaultRecipe = defaultRecipes.find(r => r.id === defaultRecipeId)
    if (!defaultRecipe) return null

    // Check if already materialized (same name in user recipes)
    const existing = userRecipes.find(r => r.name === defaultRecipe.name)
    if (existing) return existing.id

    // Create in DB
    const insertData: Record<string, string> = { name: defaultRecipe.name, household_id: householdId }
    if (defaultRecipe.icon) insertData.icon = defaultRecipe.icon

    const { data: recipe, error } = await supabase
      .from('recipes')
      .insert(insertData)
      .select()
      .single()

    if (error || !recipe) return null

    if (defaultRecipe.ingredients && defaultRecipe.ingredients.length > 0) {
      await supabase
        .from('recipe_ingredients')
        .insert(defaultRecipe.ingredients.map(ing => ({ recipe_id: recipe.id, name: ing.name })))
    }

    await fetchRecipes()
    return recipe.id
  }

  return { recipes, loading, addRecipe, updateRecipe, deleteRecipe, materializeDefaultRecipe, refetch: fetchRecipes }
}
