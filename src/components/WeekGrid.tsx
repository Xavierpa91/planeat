import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { MealSlot } from './MealSlot'
import { FoodIcon } from './FoodIcon'
import { DAYS, ALL_MEAL_TYPES } from '../types'
import { useI18n } from '../lib/i18n'
import type { MenuSlot as MenuSlotType, Recipe, MealType } from '../types'

type MenuLayout = 'stacked' | 'focus' | 'calendar'

interface WeekGridProps {
  slots: MenuSlotType[]
  recipes: Recipe[]
  activeMealTypes: MealType[]
  layout: MenuLayout
  weekStart?: Date
  onSetSlot: (day: number, mealType: MealType, recipeId: string | null, customMeal: string | null) => Promise<void>
  onClearSlot: (day: number, mealType: MealType) => Promise<void>
  onAddExtra?: (day: number, mealType: MealType, recipeId: string) => Promise<void>
  onRemoveExtra?: (extraId: string) => Promise<void>
  onMaterializeDefault?: (defaultRecipeId: string) => Promise<string | null>
}

export function WeekGrid({ slots, recipes, activeMealTypes, layout, weekStart, onSetSlot, onClearSlot, onAddExtra, onRemoveExtra, onMaterializeDefault }: WeekGridProps) {
  const { t, locale } = useI18n()
  const [editingSlot, setEditingSlot] = useState<{ day: number; meal: MealType; addingExtra?: boolean } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [customMeal, setCustomMeal] = useState('')
  const [saving, setSaving] = useState(false)

  // Day focus layout state
  const [selectedDay, setSelectedDay] = useState(() => {
    if (!weekStart) return 0
    const today = new Date()
    const diff = Math.floor((today.getTime() - weekStart.getTime()) / 86400000)
    return diff >= 0 && diff <= 6 ? diff : 0
  })

  // Reset selectedDay when weekStart changes
  useEffect(() => {
    if (!weekStart) return
    const today = new Date()
    const diff = Math.floor((today.getTime() - weekStart.getTime()) / 86400000)
    setSelectedDay(diff >= 0 && diff <= 6 ? diff : 0)
  }, [weekStart])

  const FILTER_CATEGORIES = ['Carnes', 'Pescados', 'Legumbres', 'Pasta y Arroces', 'Ensaladas', 'Huevos', 'Sopas y Cremas', 'Rapidas'] as const
  const FILTER_CATEGORY_KEYS: Record<string, string> = {
    'Carnes': 'recipeCat.carnes',
    'Pescados': 'recipeCat.pescados',
    'Legumbres': 'recipeCat.legumbres',
    'Pasta y Arroces': 'recipeCat.pasta',
    'Ensaladas': 'recipeCat.ensaladas',
    'Huevos': 'recipeCat.huevos',
    'Sopas y Cremas': 'recipeCat.sopas',
    'Rapidas': 'recipeCat.rapidas',
  }

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

    if (editingSlot.addingExtra && onAddExtra) {
      await onAddExtra(editingSlot.day, editingSlot.meal, recipeId)
    } else {
      await onSetSlot(editingSlot.day, editingSlot.meal, recipeId, null)
    }

    setEditingSlot(null)
    setSearchQuery('')
    setCategoryFilter(null)
    setSaving(false)
  }

  const handleSetCustomMeal = async () => {
    if (!editingSlot || !customMeal.trim()) return
    await onSetSlot(editingSlot.day, editingSlot.meal, null, customMeal.trim())
    setEditingSlot(null)
    setCustomMeal('')
  }

  const filteredRecipes = recipes.filter(r => {
    const matchesSearch = !searchQuery || r.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !categoryFilter
      || (categoryFilter === 'Rapidas' ? (r.prep_minutes != null && r.prep_minutes <= 15) : r.category === categoryFilter)
    return matchesSearch && matchesCategory
  })

  const defaultRecipes = filteredRecipes.filter(r => r.is_default)
  const userRecipes = filteredRecipes.filter(r => !r.is_default)

  const openSlotEditor = (day: number, meal: MealType, addingExtra?: boolean) => {
    setEditingSlot({ day, meal, addingExtra })
    setSearchQuery('')
    setCategoryFilter(null)
    setCustomMeal('')
  }

  // ─── Layout: Stacked (default, original layout) ───
  const renderStacked = () => {
    const todayStr = new Date().toDateString()

    return (
    <div className="space-y-2">
      {DAYS.map((dayName, dayIndex) => {
        const daySlots = activeMealTypes.map(mt => getSlot(dayIndex, mt))
        const hasMeals = daySlots.some(s => s != null)
        const dayDate = weekStart ? new Date(weekStart.getTime() + dayIndex * 86400000) : null
        const dayNum = dayDate ? dayDate.getDate() : null
        const isToday = dayDate ? dayDate.toDateString() === todayStr : false

        return (
          <div key={dayIndex} className={`rounded-2xl border overflow-hidden bg-surface shadow-[var(--shadow-card)] ${
            isToday ? 'border-accent ring-1 ring-accent/20' : 'border-line'
          }`}>
            <div className={`px-3 py-2 border-b flex items-center justify-between ${
              isToday ? 'bg-accent-soft border-accent/10' : hasMeals ? 'bg-accent-soft/50 border-accent/10' : 'border-line-2'
            }`}>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-ink">{dayName}</span>
                {dayNum != null && <span className="text-sm font-bold text-muted">{dayNum}</span>}
                {isToday && <span className="text-[10px] font-semibold text-accent-strong bg-accent-soft px-1.5 py-0.5 rounded-full">Hoy</span>}
              </div>
            </div>
            <div className="grid divide-x divide-line-2" style={{ gridTemplateColumns: `repeat(${activeMealTypes.length}, 1fr)` }}>
              {activeMealTypes.map(mealType => {
                const slot = getSlot(dayIndex, mealType)
                const isEditing = editingSlot?.day === dayIndex && editingSlot?.meal === mealType

                return (
                  <MealSlot
                    key={mealType}
                    label={ALL_MEAL_TYPES[mealType]}
                    slot={slot}
                    isEditing={isEditing}
                    onEdit={() => openSlotEditor(dayIndex, mealType)}
                    onClear={() => onClearSlot(dayIndex, mealType)}
                    onAddExtra={onAddExtra ? () => openSlotEditor(dayIndex, mealType, true) : undefined}
                    onRemoveExtra={onRemoveExtra}
                  />
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
    )
  }

  // ─── Layout: Day Focus ───
  const renderDayFocus = () => {
    const isToday = (dayIndex: number) => {
      if (!weekStart) return false
      const dayDate = new Date(weekStart.getTime() + dayIndex * 86400000)
      const today = new Date()
      return dayDate.toDateString() === today.toDateString()
    }

    return (
      <div className="space-y-3">
        {/* Day tab bar */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {DAYS.map((dayName, i) => {
            const dayDate = weekStart ? new Date(weekStart.getTime() + i * 86400000) : null
            const isSelected = i === selectedDay
            const dayHasMeals = activeMealTypes.some(mt => getSlot(i, mt) != null)

            return (
              <button
                key={i}
                onClick={() => setSelectedDay(i)}
                className={`flex flex-col items-center px-3 py-2 rounded-xl min-w-[48px] transition-all pressable ${
                  isSelected
                    ? 'bg-ink text-bg shadow-sm'
                    : isToday(i)
                    ? 'bg-accent-soft text-accent-strong border border-accent/20'
                    : 'bg-surface text-muted border border-line'
                }`}
              >
                <span className="text-[10px] font-semibold uppercase">{dayName.slice(0, 3)}</span>
                <span className="text-sm font-bold">{dayDate?.getDate()}</span>
                {dayHasMeals && !isSelected && (
                  <div className="flex gap-0.5 mt-0.5">
                    {activeMealTypes.map(mt => (
                      <div
                        key={mt}
                        className={`w-1 h-1 rounded-full ${getSlot(i, mt) ? 'bg-accent' : 'bg-line'}`}
                      />
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Selected day title */}
        <h3 className="font-display font-semibold text-lg text-ink tracking-[-0.02em]">
          {DAYS[selectedDay]}
        </h3>

        {/* Meal cards for selected day */}
        <div className="space-y-3">
          {activeMealTypes.map(mealType => {
            const slot = getSlot(selectedDay, mealType)
            const mealName = slot?.recipe?.name ?? slot?.custom_meal
            const recipeIcon = slot?.recipe?.icon
            const extras = slot?.extra_recipes ?? []
            const ingredients = slot?.recipe?.ingredients

            return (
              <div
                key={mealType}
                className="bg-surface rounded-2xl border border-line p-4 shadow-[var(--shadow-card)]"
              >
                <span className="text-[10px] uppercase tracking-wider text-muted-2 font-semibold">
                  {ALL_MEAL_TYPES[mealType]}
                </span>
                {mealName ? (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-start gap-3">
                      {recipeIcon && (
                        <span className="w-11 h-11 rounded-xl bg-accent-soft text-accent-strong flex items-center justify-center shrink-0">
                          <FoodIcon kind={recipeIcon} size={22} />
                        </span>
                      )}
                      <div className="flex-1 min-w-0">
                        <button
                          onClick={() => openSlotEditor(selectedDay, mealType)}
                          className="text-sm font-semibold text-ink hover:text-accent-strong transition-colors text-left"
                        >
                          {mealName}
                        </button>
                        {ingredients && ingredients.length > 0 && (
                          <p className="text-xs text-muted mt-0.5">
                            {ingredients.map(i => i.name).join(' · ')}
                          </p>
                        )}
                        {slot?.recipe?.prep_minutes && (
                          <p className="text-xs text-muted-2 mt-0.5">{slot.recipe.prep_minutes} min</p>
                        )}
                      </div>
                      <button
                        onClick={() => onClearSlot(selectedDay, mealType)}
                        className="text-muted-2 hover:text-danger transition-colors shrink-0 mt-1 text-xs"
                      >
                        ×
                      </button>
                    </div>
                    {/* Extra recipes */}
                    {extras.map(extra => (
                      <div key={extra.id} className="flex items-center gap-3 pl-2 border-l-2 border-line-2 ml-1">
                        {extra.recipe?.icon && (
                          <span className="w-7 h-7 rounded-lg bg-accent-soft text-accent-strong flex items-center justify-center shrink-0">
                            <FoodIcon kind={extra.recipe.icon} size={14} />
                          </span>
                        )}
                        <span className="text-sm text-ink flex-1">{extra.recipe?.name}</span>
                        {onRemoveExtra && (
                          <button
                            onClick={() => onRemoveExtra(extra.id)}
                            className="text-muted-2 hover:text-danger transition-colors text-xs"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    {onAddExtra && (
                      <button
                        onClick={() => openSlotEditor(selectedDay, mealType, true)}
                        className="flex items-center gap-1 text-xs text-muted-2 hover:text-accent transition-colors mt-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{t('menu.extraDish')}</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => openSlotEditor(selectedDay, mealType)}
                    className="mt-2 w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-line rounded-xl text-sm text-muted-2 hover:text-accent hover:border-accent/30 transition-colors pressable"
                  >
                    <Plus className="w-4 h-4" />
                    {t('menu.add')}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ─── Layout: Calendar ───
  const renderCalendar = () => {
    const isToday = (dayIndex: number) => {
      if (!weekStart) return false
      const dayDate = new Date(weekStart.getTime() + dayIndex * 86400000)
      const today = new Date()
      return dayDate.toDateString() === today.toDateString()
    }

    return (
      <div className="overflow-x-auto -mx-4 px-4">
        <div
          className="min-w-[600px]"
          style={{
            display: 'grid',
            gridTemplateColumns: '70px repeat(7, 1fr)',
            gap: '1px',
          }}
        >
          {/* Header row: empty + 7 day headers */}
          <div className="p-1" />
          {DAYS.map((dayName, i) => {
            const dayDate = weekStart ? new Date(weekStart.getTime() + i * 86400000) : null
            return (
              <div
                key={i}
                className={`py-2 text-center rounded-t-lg ${isToday(i) ? 'bg-accent-soft' : ''}`}
              >
                <div className="text-[10px] font-semibold uppercase text-muted-2">{dayName.slice(0, 3)}</div>
                <div className={`text-sm font-bold ${isToday(i) ? 'text-accent-strong' : 'text-ink'}`}>
                  {dayDate?.getDate()}
                </div>
              </div>
            )
          })}

          {/* Rows: one per meal type */}
          {activeMealTypes.map(mt => (
            <>
              <div
                key={mt + '-label'}
                className="py-2 px-1 text-[10px] uppercase tracking-wider text-muted-2 font-semibold flex items-center"
              >
                {ALL_MEAL_TYPES[mt]}
              </div>
              {DAYS.map((_, dayIndex) => {
                const slot = getSlot(dayIndex, mt)
                const mealName = slot?.recipe?.name ?? slot?.custom_meal
                const recipeIcon = slot?.recipe?.icon

                return (
                  <button
                    key={`${mt}-${dayIndex}`}
                    onClick={() => openSlotEditor(dayIndex, mt)}
                    className={`min-h-[48px] p-1.5 border border-line-2 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-colors pressable hover:bg-accent-soft/50 ${
                      isToday(dayIndex) ? 'bg-accent-soft/30' : 'bg-surface'
                    }`}
                  >
                    {mealName ? (
                      <>
                        {recipeIcon && <FoodIcon kind={recipeIcon} size={14} />}
                        <span className="text-[9px] text-ink text-center leading-tight line-clamp-2">{mealName}</span>
                      </>
                    ) : (
                      <Plus className="w-3 h-3 text-muted-2" />
                    )}
                  </button>
                )
              })}
            </>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {layout === 'stacked' && renderStacked()}
      {layout === 'focus' && renderDayFocus()}
      {layout === 'calendar' && renderCalendar()}

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
                {editingSlot.addingExtra && <span className="text-accent ml-2 text-sm font-normal">+ {t('menu.extraDish')}</span>}
              </h3>
              <input
                type="text"
                placeholder={t('menu.searchRecipe')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="mt-2 w-full px-3 py-2 border border-line rounded-xl text-sm bg-surface-2 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-accent"
                autoFocus
              />
              <div className="flex gap-1.5 mt-2 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setCategoryFilter(null)}
                  className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors pressable ${
                    !categoryFilter ? 'bg-ink text-bg border-ink' : 'bg-surface border-line text-muted'
                  }`}
                >
                  {t('recipeCat.all')}
                </button>
                {FILTER_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
                    className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors pressable ${
                      categoryFilter === cat ? 'bg-ink text-bg border-ink' : 'bg-surface border-line text-muted'
                    }`}
                  >
                    {t(FILTER_CATEGORY_KEYS[cat] ?? cat)}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-y-auto flex-1 p-2">
              {saving && (
                <div className="flex justify-center py-4">
                  <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {!saving && userRecipes.length > 0 && (
                <>
                  <p className="text-[10px] uppercase tracking-wider text-muted-2 px-3 py-1.5 font-semibold">{t('menu.myRecipes')}</p>
                  {userRecipes.map(recipe => (
                    <button
                      key={recipe.id}
                      onClick={() => handleSelectRecipe(recipe)}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-accent-soft text-sm text-ink transition-colors flex items-center gap-2 pressable"
                    >
                      {recipe.icon && <FoodIcon kind={recipe.icon} size={18} />}
                      <span className="flex-1">
                        {locale === 'en' && recipe.name_en ? recipe.name_en : recipe.name}
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
                  <p className="text-[10px] uppercase tracking-wider text-muted-2 px-3 py-1.5 font-semibold mt-1">{t('menu.planeatRecipes')}</p>
                  {defaultRecipes.map(recipe => (
                    <button
                      key={recipe.id}
                      onClick={() => handleSelectRecipe(recipe)}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-accent-soft text-sm text-ink transition-colors flex items-center gap-2 pressable"
                    >
                      {recipe.icon && <FoodIcon kind={recipe.icon} size={18} />}
                      <span className="flex-1">
                        {locale === 'en' && recipe.name_en ? recipe.name_en : recipe.name}
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
                <p className="text-sm text-muted text-center py-4">{t('menu.noRecipes')}</p>
              )}
            </div>
            <div className="p-3 border-t border-line-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={t('menu.customPlaceholder')}
                  value={customMeal}
                  onChange={e => setCustomMeal(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSetCustomMeal()}
                  className="flex-1 px-3 py-2 border border-line rounded-xl text-sm bg-surface-2 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <button
                  onClick={handleSetCustomMeal}
                  disabled={!customMeal.trim()}
                  className="px-4 py-2 bg-accent text-white rounded-full text-sm font-semibold disabled:opacity-40 hover:bg-accent-strong transition-colors pressable"
                >
                  {t('menu.add')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
