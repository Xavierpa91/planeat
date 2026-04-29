import { useState } from 'react'
import { MealSlot } from './MealSlot'
import { DAYS, MEAL_TYPES } from '../types'
import type { MenuSlot as MenuSlotType, Recipe } from '../types'

interface WeekGridProps {
  slots: MenuSlotType[]
  recipes: Recipe[]
  onSetSlot: (day: number, mealType: 'lunch' | 'dinner', recipeId: string | null, customMeal: string | null) => Promise<void>
  onClearSlot: (day: number, mealType: 'lunch' | 'dinner') => Promise<void>
}

export function WeekGrid({ slots, recipes, onSetSlot, onClearSlot }: WeekGridProps) {
  const [editingSlot, setEditingSlot] = useState<{ day: number; meal: 'lunch' | 'dinner' } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [customMeal, setCustomMeal] = useState('')

  const getSlot = (day: number, meal: 'lunch' | 'dinner') =>
    slots.find(s => s.day_of_week === day && s.meal_type === meal)

  const handleSelectRecipe = async (recipeId: string) => {
    if (!editingSlot) return
    await onSetSlot(editingSlot.day, editingSlot.meal, recipeId, null)
    setEditingSlot(null)
    setSearchQuery('')
  }

  const handleSetCustomMeal = async () => {
    if (!editingSlot || !customMeal.trim()) return
    await onSetSlot(editingSlot.day, editingSlot.meal, null, customMeal.trim())
    setEditingSlot(null)
    setCustomMeal('')
  }

  const filteredRecipes = recipes.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-2">
      {DAYS.map((dayName, dayIndex) => (
        <div key={dayIndex} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-3 py-2 border-b border-slate-100">
            <span className="font-semibold text-sm text-slate-700">{dayName}</span>
          </div>
          <div className="grid grid-cols-2 divide-x divide-slate-100">
            {(['lunch', 'dinner'] as const).map(mealType => {
              const slot = getSlot(dayIndex, mealType)
              const isEditing = editingSlot?.day === dayIndex && editingSlot?.meal === mealType

              return (
                <MealSlot
                  key={mealType}
                  label={MEAL_TYPES[mealType]}
                  slot={slot}
                  isEditing={isEditing}
                  onEdit={() => {
                    setEditingSlot({ day: dayIndex, meal: mealType })
                    setSearchQuery('')
                    setCustomMeal('')
                  }}
                  onClear={() => onClearSlot(dayIndex, mealType)}
                />
              )
            })}
          </div>
        </div>
      ))}

      {/* Recipe selector modal */}
      {editingSlot && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center" onClick={() => setEditingSlot(null)}>
          <div
            className="bg-white w-full sm:max-w-md sm:rounded-xl rounded-t-xl max-h-[70vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">
                {DAYS[editingSlot.day]} - {MEAL_TYPES[editingSlot.meal]}
              </h3>
              <input
                type="text"
                placeholder="Buscar receta..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="mt-2 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                autoFocus
              />
            </div>
            <div className="overflow-y-auto flex-1 p-2">
              {filteredRecipes.map(recipe => (
                <button
                  key={recipe.id}
                  onClick={() => handleSelectRecipe(recipe.id)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-green-50 text-sm text-slate-700 transition-colors"
                >
                  {recipe.name}
                  {recipe.ingredients && recipe.ingredients.length > 0 && (
                    <span className="text-xs text-slate-400 ml-2">
                      ({recipe.ingredients.map(i => i.name).join(', ')})
                    </span>
                  )}
                </button>
              ))}
              {filteredRecipes.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">No hay recetas</p>
              )}
            </div>
            <div className="p-3 border-t border-slate-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="O escribe algo personalizado..."
                  value={customMeal}
                  onChange={e => setCustomMeal(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSetCustomMeal()}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={handleSetCustomMeal}
                  disabled={!customMeal.trim()}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-green-600 transition-colors"
                >
                  Anadir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
