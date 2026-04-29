import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Recipe } from '../types'

export function useRecipes(householdId: string | undefined) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRecipes = useCallback(async () => {
    if (!householdId) return
    setLoading(true)

    const { data } = await supabase
      .from('recipes')
      .select('*, ingredients:recipe_ingredients(*)')
      .eq('household_id', householdId)
      .order('name')

    setRecipes(data ?? [])
    setLoading(false)
  }, [householdId])

  useEffect(() => {
    fetchRecipes()
  }, [fetchRecipes])

  const addRecipe = async (name: string, ingredients: string[]) => {
    if (!householdId) return

    const { data: recipe, error } = await supabase
      .from('recipes')
      .insert({ name, household_id: householdId })
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

  const updateRecipe = async (id: string, name: string, ingredients: string[]) => {
    await supabase.from('recipes').update({ name }).eq('id', id)

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

  return { recipes, loading, addRecipe, updateRecipe, deleteRecipe, refetch: fetchRecipes }
}
