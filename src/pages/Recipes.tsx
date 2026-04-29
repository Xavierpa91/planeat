import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { RecipeForm } from '../components/RecipeForm'
import { useRecipes } from '../hooks/useRecipes'
import type { Recipe } from '../types'

interface RecipesPageProps {
  householdId: string
}

export function RecipesPage({ householdId }: RecipesPageProps) {
  const { recipes, loading, addRecipe, updateRecipe, deleteRecipe } = useRecipes(householdId)
  const [showForm, setShowForm] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)

  const handleSave = async (name: string, ingredients: string[]) => {
    if (editingRecipe) {
      await updateRecipe(editingRecipe.id, name, ingredients)
      setEditingRecipe(null)
    } else {
      await addRecipe(name, ingredients)
      setShowForm(false)
    }
  }

  const handleDelete = async (recipe: Recipe) => {
    if (confirm(`Eliminar "${recipe.name}"?`)) {
      await deleteRecipe(recipe.id)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Recetas</h2>
        {!showForm && !editingRecipe && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva
          </button>
        )}
      </div>

      {(showForm || editingRecipe) && (
        <RecipeForm
          recipe={editingRecipe ?? undefined}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false)
            setEditingRecipe(null)
          }}
        />
      )}

      {recipes.length === 0 && !showForm ? (
        <div className="text-center py-12 text-slate-400">
          <p className="text-sm">No hay recetas todavia</p>
          <p className="text-xs mt-1">Crea tu primera receta para empezar</p>
        </div>
      ) : (
        <div className="space-y-2">
          {recipes.map(recipe => (
            <div key={recipe.id} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-slate-800 text-sm">{recipe.name}</h3>
                  {recipe.ingredients && recipe.ingredients.length > 0 && (
                    <p className="text-xs text-slate-400 mt-1">
                      {recipe.ingredients.map(i => i.name).join(', ')}
                    </p>
                  )}
                </div>
                <div className="flex gap-1 ml-2">
                  <button
                    onClick={() => setEditingRecipe(recipe)}
                    className="p-1.5 text-slate-300 hover:text-green-500 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(recipe)}
                    className="p-1.5 text-slate-300 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
