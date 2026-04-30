import { useState } from 'react'
import { Plus, Pencil, Trash2, ShieldAlert } from 'lucide-react'
import { RecipeForm } from '../components/RecipeForm'
import { FoodIcon } from '../components/FoodIcon'
import { useRecipes } from '../hooks/useRecipes'
import { ALLERGENS, detectAllergens } from '../lib/allergens'
import { useI18n } from '../lib/i18n'
import type { Recipe } from '../types'

interface RecipesPageProps {
  householdId: string
}

type RecipeTab = 'mine' | 'default'

export function RecipesPage({ householdId }: RecipesPageProps) {
  const { recipes, loading, addRecipe, updateRecipe, deleteRecipe } = useRecipes(householdId)
  const { t, locale } = useI18n()
  const [showForm, setShowForm] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [activeTab, setActiveTab] = useState<RecipeTab>('mine')
  const [showAllergens, setShowAllergens] = useState(false)

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
        <h2 className="text-lg font-extrabold text-ink tracking-[-0.02em]">{t('recipes.title')}</h2>
        {!showForm && !editingRecipe && activeTab === 'mine' && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-accent text-white rounded-full text-sm font-semibold hover:bg-accent-strong transition-colors pressable"
          >
            <Plus className="w-4 h-4" />
            {t('recipes.new')}
          </button>
        )}
      </div>

      {/* Allergens toggle + Tabs */}
      <button
        onClick={() => setShowAllergens(!showAllergens)}
        className={`flex items-center gap-1.5 text-xs font-semibold pressable transition-colors ${
          showAllergens ? 'text-accent-strong' : 'text-muted'
        }`}
      >
        <ShieldAlert className="w-3.5 h-3.5" />
        {t('recipes.showAllergens')}
      </button>

      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('mine')}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-xl border-2 transition-colors pressable ${
            activeTab === 'mine' ? 'bg-accent-soft border-accent text-accent-strong' : 'bg-surface border-line text-muted'
          }`}
        >
          {t('recipes.myRecipes')}
        </button>
        <button
          onClick={() => setActiveTab('default')}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-xl border-2 transition-colors pressable ${
            activeTab === 'default' ? 'bg-accent-soft border-accent text-accent-strong' : 'bg-surface border-line text-muted'
          }`}
        >
          {t('recipes.planeatRecipes')}
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
            {activeTab === 'mine' ? t('recipes.noRecipesYet') : t('recipes.noDefaults')}
          </p>
          {activeTab === 'mine' && (
            <p className="text-xs mt-1 text-muted-2">{t('recipes.createFirst')}</p>
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
                    <h3 className="font-semibold text-ink text-sm">{locale === 'en' && recipe.name_en ? recipe.name_en : recipe.name}</h3>
                    {recipe.ingredients && recipe.ingredients.length > 0 && (
                      <p className="text-xs text-muted mt-1">
                        {recipe.ingredients.map(i => i.name).join(', ')}
                      </p>
                    )}
                    {showAllergens && (() => {
                      const allergenIds = (recipe.allergens && recipe.allergens.length > 0)
                        ? recipe.allergens
                        : detectAllergens(recipe.ingredients?.map(i => i.name) ?? [])
                      return allergenIds.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {allergenIds.map(a => {
                            const info = ALLERGENS.find(al => al.id === a)
                            return info ? (
                              <span key={a} className="text-[10px] bg-bg px-1.5 py-0.5 rounded-full text-muted" title={info.label}>
                                {info.icon} {info.label}
                              </span>
                            ) : null
                          })}
                        </div>
                      ) : null
                    })()}
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
