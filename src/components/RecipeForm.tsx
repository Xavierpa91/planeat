import { useState, useRef, useEffect } from 'react'
import { Plus, X, Save } from 'lucide-react'
import { FoodIcon, FOOD_ICONS } from './FoodIcon'
import { useI18n } from '../lib/i18n'
import type { Recipe } from '../types'

const RECIPE_CATEGORIES = ['Carnes', 'Pescados', 'Legumbres', 'Pasta y Arroces', 'Ensaladas', 'Huevos', 'Sopas y Cremas'] as const
const CATEGORY_KEYS: Record<string, string> = {
  'Carnes': 'recipeCat.carnes',
  'Pescados': 'recipeCat.pescados',
  'Legumbres': 'recipeCat.legumbres',
  'Pasta y Arroces': 'recipeCat.pasta',
  'Ensaladas': 'recipeCat.ensaladas',
  'Huevos': 'recipeCat.huevos',
  'Sopas y Cremas': 'recipeCat.sopas',
}

interface RecipeFormProps {
  recipe?: Recipe
  onSave: (name: string, ingredients: string[], icon?: string, category?: string) => Promise<void>
  onCancel: () => void
}

export function RecipeForm({ recipe, onSave, onCancel }: RecipeFormProps) {
  const { t } = useI18n()
  const [name, setName] = useState(recipe?.name ?? '')
  const [ingredients, setIngredients] = useState<string[]>(
    recipe?.ingredients?.map(i => i.name) ?? ['']
  )
  const [icon, setIcon] = useState<string>(recipe?.icon ?? '')
  const [category, setCategory] = useState<string>(recipe?.category ?? '')
  const [saving, setSaving] = useState(false)
  const ingredientRefs = useRef<(HTMLInputElement | null)[]>([])

  // Focus last ingredient input when a new one is added
  useEffect(() => {
    const last = ingredientRefs.current[ingredients.length - 1]
    if (last && ingredients[ingredients.length - 1] === '') {
      last.focus()
    }
  }, [ingredients.length])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setSaving(true)
    const validIngredients = ingredients.filter(i => i.trim())
    await onSave(name.trim(), validIngredients, icon || undefined, category || undefined)
    setSaving(false)
  }

  const addIngredient = () => setIngredients([...ingredients, ''])

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const updateIngredient = (index: number, value: string) => {
    const updated = [...ingredients]
    updated[index] = value
    setIngredients(updated)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface rounded-2xl border border-line p-4 space-y-4 shadow-[var(--shadow-card)]">
      <div>
        <label className="block text-sm font-semibold text-ink mb-1">Nombre de la receta</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Ej: Macarrones con tomate"
          className="w-full px-3 py-2 border border-line rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          autoFocus
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-ink mb-2">Icono</label>
        <div className="flex flex-wrap gap-1.5">
          {FOOD_ICONS.map(kind => (
            <button
              key={kind}
              type="button"
              onClick={() => setIcon(kind)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors pressable ${
                icon === kind ? 'bg-accent text-white' : 'bg-bg text-muted hover:bg-accent-soft hover:text-accent-strong'
              }`}
            >
              <FoodIcon kind={kind} size={18} />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-ink mb-2">{t('recipes.category')}</label>
        <div className="flex flex-wrap gap-1.5">
          {RECIPE_CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(category === cat ? '' : cat)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors pressable ${
                category === cat ? 'bg-accent text-white border-accent' : 'bg-bg border-line text-muted hover:text-ink'
              }`}
            >
              {t(CATEGORY_KEYS[cat])}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-ink mb-2">Ingredientes</label>
        <div className="space-y-2">
          {ingredients.map((ing, i) => (
            <div key={i} className="flex gap-2">
              <input
                ref={el => { ingredientRefs.current[i] = el }}
                type="text"
                value={ing}
                onChange={e => updateIngredient(i, e.target.value)}
                placeholder="Ej: Tomate"
                className="flex-1 px-3 py-2 border border-line rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addIngredient()
                  }
                }}
              />
              {ingredients.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeIngredient(i)}
                  className="text-muted-2 hover:text-danger transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addIngredient}
          className="mt-2 flex items-center gap-1 text-sm text-accent-strong hover:text-accent transition-colors"
        >
          <Plus className="w-4 h-4" />
          Anadir ingrediente
        </button>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={!name.trim() || saving}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-accent text-white rounded-full text-sm font-semibold disabled:opacity-40 hover:bg-accent-strong transition-colors pressable"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-line rounded-full text-sm text-ink-2 hover:bg-bg transition-colors pressable"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
