import { useState } from 'react'
import { Plus, X, Save } from 'lucide-react'
import type { Recipe } from '../types'

interface RecipeFormProps {
  recipe?: Recipe
  onSave: (name: string, ingredients: string[]) => Promise<void>
  onCancel: () => void
}

export function RecipeForm({ recipe, onSave, onCancel }: RecipeFormProps) {
  const [name, setName] = useState(recipe?.name ?? '')
  const [ingredients, setIngredients] = useState<string[]>(
    recipe?.ingredients?.map(i => i.name) ?? ['']
  )
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setSaving(true)
    const validIngredients = ingredients.filter(i => i.trim())
    await onSave(name.trim(), validIngredients)
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
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de la receta</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Ej: Macarrones con tomate"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          autoFocus
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Ingredientes</label>
        <div className="space-y-2">
          {ingredients.map((ing, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={ing}
                onChange={e => updateIngredient(i, e.target.value)}
                placeholder="Ej: Tomate"
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  className="text-slate-300 hover:text-red-400 transition-colors"
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
          className="mt-2 flex items-center gap-1 text-sm text-green-600 hover:text-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Anadir ingrediente
        </button>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={!name.trim() || saving}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-green-600 transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
