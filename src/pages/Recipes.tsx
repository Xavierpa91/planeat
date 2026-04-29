import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { RecipeForm } from '../components/RecipeForm'
import { FoodIcon } from '../components/FoodIcon'
import { useRecipes } from '../hooks/useRecipes'
import type { Recipe } from '../types'

interface RecipesPageProps {
  householdId: string
}

type RecipeTab = 'mine' | 'default'

export function RecipesPage({ householdId }: RecipesPageProps) {
  const { recipes, loading, addRecipe, updateRecipe, deleteRecipe } = useRecipes(householdId)
  const [showForm, setShowForm] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [activeTab, setActiveTab] = useState<RecipeTab>('mine')

  const userRecipes = recipes.filter(r => !r.is_default)
  const defaultRecipes = recipes.filter(r => r.is_default)

  const displayedRecipes = activeTab === 'mine' ? userRecipes : defaultRecipes

  const handleSave = async (name: string, ingredients: string[], icon?: string) => {
    if (editingRecipe) {
      await updateRecipe(editingRecipe.id, name, ingredients, icon)
      setEditingRecipe(null)
    } else {
      await addRecipe(name, ingredients, icon)
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
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-ink tracking-[-0.02em]">Recetas</h2>
        {!showForm && !editingRecipe && activeTab === 'mine' && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-accent text-white rounded-full text-sm font-semibold hover:bg-accent-strong transition-colors pressable"
          >
            <Plus className="w-4 h-4" />
            Nueva
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-bg rounded-full p-1">
        <button
          onClick={() => setActiveTab('mine')}
          className={`flex-1 py-2 text-sm font-semibold rounded-full transition-colors pressable ${
            activeTab === 'mine' ? 'bg-surface text-accent-strong shadow-sm' : 'text-muted'
          }`}
        >
          Mis recetas
        </button>
        <button
          onClick={() => setActiveTab('default')}
          className={`flex-1 py-2 text-sm font-semibold rounded-full transition-colors pressable ${
            activeTab === 'default' ? 'bg-surface text-accent-strong shadow-sm' : 'text-muted'
          }`}
        >
          Recetas PlanEat
        </button>
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

      {displayedRecipes.length === 0 && !showForm ? (
        <div className="text-center py-12 text-muted">
          <p className="text-sm">
            {activeTab === 'mine' ? 'No hay recetas todavia' : 'No hay recetas por defecto'}
          </p>
          {activeTab === 'mine' && (
            <p className="text-xs mt-1 text-muted-2">Crea tu primera receta para empezar</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {displayedRecipes.map(recipe => (
            <div key={recipe.id} className="bg-surface rounded-2xl border border-line p-4 pressable">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {recipe.icon && (
                    <span className="w-9 h-9 rounded-xl bg-accent-soft text-accent-strong flex items-center justify-center shrink-0 mt-0.5">
                      <FoodIcon kind={recipe.icon} size={18} />
                    </span>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-ink text-sm">{recipe.name}</h3>
                    {recipe.ingredients && recipe.ingredients.length > 0 && (
                      <p className="text-xs text-muted mt-1">
                        {recipe.ingredients.map(i => i.name).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
                {!recipe.is_default && (
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => setEditingRecipe(recipe)}
                      className="p-1.5 text-muted-2 hover:text-accent transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(recipe)}
                      className="p-1.5 text-muted-2 hover:text-danger transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
