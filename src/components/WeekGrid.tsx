import { useState } from 'react'
import { MealSlot } from './MealSlot'
import { FoodIcon } from './FoodIcon'
import { DAYS, ALL_MEAL_TYPES } from '../types'
import type { MenuSlot as MenuSlotType, Recipe, MealType } from '../types'

interface WeekGridProps {
  slots: MenuSlotType[]
  recipes: Recipe[]
  activeMealTypes: MealType[]
  compact?: boolean
  onSetSlot: (day: number, mealType: MealType, recipeId: string | null, customMeal: string | null) => Promise<void>
  onClearSlot: (day: number, mealType: MealType) => Promise<void>
  onMaterializeDefault?: (defaultRecipeId: string) => Promise<string | null>
}

export function WeekGrid({ slots, recipes, activeMealTypes, compact, onSetSlot, onClearSlot, onMaterializeDefault }: WeekGridProps) {
  const [editingSlot, setEditingSlot] = useState<{ day: number; meal: MealType } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [customMeal, setCustomMeal] = useState('')
  const [saving, setSaving] = useState(false)

  const getSlot = (day: number, meal: MealType) =>
    slots.find(s => s.day_of_week === day && s.meal_type === meal)

  const handleSelectRecipe = async (recipe: Recipe) => {
    if (!editingSlot || saving) return
    setSaving(true)

    let recipeId = recipe.id

    // If it's a default recipe, materialize it first
    if (recipe.is_default && onMaterializeDefault) {
      const realId = await onMaterializeDefault(recipe.id)
      if (!realId) {
        setSaving(false)
        return
      }
      recipeId = realId
    }

    await onSetSlot(editingSlot.day, editingSlot.meal, recipeId, null)
    setEditingSlot(null)
    setSearchQuery('')
    setSaving(false)
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

  const defaultRecipes = filteredRecipes.filter(r => r.is_default)
  const userRecipes = filteredRecipes.filter(r => !r.is_default)

  return (
    <div className="space-y-2">
      {DAYS.map((dayName, dayIndex) => {
        const daySlots = activeMealTypes.map(mt => getSlot(dayIndex, mt))
        const hasMeals = daySlots.some(s => s != null)

        return (
          <div key={dayIndex} className={`${compact ? 'rounded-lg' : 'rounded-2xl'} border overflow-hidden ${hasMeals ? 'bg-accent-soft border-accent/20' : 'bg-surface border-line'}`}>
            <div className={`${compact ? 'px-2 py-1' : 'px-3 py-2'} border-b ${hasMeals ? 'border-accent/10' : 'border-line-2'}`}>
              <span className={`font-bold ${compact ? 'text-xs' : 'text-sm'} text-ink`}>{dayName}</span>
            </div>
            <div className={`grid divide-x ${hasMeals ? 'divide-accent/10' : 'divide-line-2'}`} style={{ gridTemplateColumns: `repeat(${activeMealTypes.length}, 1fr)` }}>
              {activeMealTypes.map(mealType => {
                const slot = getSlot(dayIndex, mealType)
                const isEditing = editingSlot?.day === dayIndex && editingSlot?.meal === mealType

                return (
                  <MealSlot
                    key={mealType}
                    label={ALL_MEAL_TYPES[mealType]}
                    slot={slot}
                    compact={compact}
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
        )
      })}

      {/* Recipe selector modal */}
      {editingSlot && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center animate-fade" onClick={() => !saving && setEditingSlot(null)}>
          <div
            className="bg-surface w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[70vh] flex flex-col animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-line-2">
              <h3 className="font-bold text-ink">
                {DAYS[editingSlot.day]} - {ALL_MEAL_TYPES[editingSlot.meal]}
              </h3>
              <input
                type="text"
                placeholder="Buscar receta..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="mt-2 w-full px-3 py-2 border border-line rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                autoFocus
              />
            </div>
            <div className="overflow-y-auto flex-1 p-2">
              {saving && (
                <div className="flex justify-center py-4">
                  <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {!saving && userRecipes.length > 0 && (
                <>
                  <p className="text-[10px] uppercase tracking-wider text-muted-2 px-3 py-1.5 font-semibold">Mis recetas</p>
                  {userRecipes.map(recipe => (
                    <button
                      key={recipe.id}
                      onClick={() => handleSelectRecipe(recipe)}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-accent-soft text-sm text-ink transition-colors flex items-center gap-2 pressable"
                    >
                      {recipe.icon && <FoodIcon kind={recipe.icon} size={18} />}
                      <span className="flex-1">
                        {recipe.name}
                        {recipe.ingredients && recipe.ingredients.length > 0 && (
                          <span className="text-xs text-muted ml-2">
                            ({recipe.ingredients.map(i => i.name).join(', ')})
                          </span>
                        )}
                      </span>
                    </button>
                  ))}
                </>
              )}
              {!saving && defaultRecipes.length > 0 && (
                <>
                  <p className="text-[10px] uppercase tracking-wider text-muted-2 px-3 py-1.5 font-semibold mt-1">Recetas PlanEat</p>
                  {defaultRecipes.map(recipe => (
                    <button
                      key={recipe.id}
                      onClick={() => handleSelectRecipe(recipe)}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-accent-soft text-sm text-ink transition-colors flex items-center gap-2 pressable"
                    >
                      {recipe.icon && <FoodIcon kind={recipe.icon} size={18} />}
                      <span className="flex-1">
                        {recipe.name}
                        {recipe.ingredients && recipe.ingredients.length > 0 && (
                          <span className="text-xs text-muted ml-2">
                            ({recipe.ingredients.map(i => i.name).join(', ')})
                          </span>
                        )}
                      </span>
                    </button>
                  ))}
                </>
              )}
              {!saving && filteredRecipes.length === 0 && (
                <p className="text-sm text-muted text-center py-4">No hay recetas</p>
              )}
            </div>
            <div className="p-3 border-t border-line-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="O escribe algo personalizado..."
                  value={customMeal}
                  onChange={e => setCustomMeal(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSetCustomMeal()}
                  className="flex-1 px-3 py-2 border border-line rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <button
                  onClick={handleSetCustomMeal}
                  disabled={!customMeal.trim()}
                  className="px-4 py-2 bg-accent text-white rounded-full text-sm font-semibold disabled:opacity-40 hover:bg-accent-strong transition-colors pressable"
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
