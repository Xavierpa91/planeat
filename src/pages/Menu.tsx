import { useState, useRef } from 'react'
import { ChevronLeft, ChevronRight, Copy, Calendar, Settings2, LayoutList, CalendarDays, Grid3X3 } from 'lucide-react'
import { WeekGrid } from '../components/WeekGrid'
import { useMenu } from '../hooks/useMenu'
import { useRecipes } from '../hooks/useRecipes'
import { getMonday, shiftWeek, formatWeekRange, formatDate } from '../lib/week'
import { useI18n } from '../lib/i18n'
import { ALL_MEAL_TYPES, DEFAULT_MEAL_TYPES } from '../types'
import type { MealType } from '../types'

interface MenuPageProps {
  householdId: string
}

export function MenuPage({ householdId }: MenuPageProps) {
  const [currentWeek, setCurrentWeek] = useState(() => getMonday())
  const { slots, loading, setSlot, clearSlot, addExtraRecipe, removeExtraRecipe, copyMenuToWeek } = useMenu(householdId, currentWeek)
  const { recipes, materializeDefaultRecipe } = useRecipes(householdId)
  const { t } = useI18n()
  const [showCopyPicker, setShowCopyPicker] = useState(false)
  const [copyTarget, setCopyTarget] = useState('')
  const [activeMealTypes, setActiveMealTypes] = useState<MealType[]>(DEFAULT_MEAL_TYPES)
  const [showMealConfig, setShowMealConfig] = useState(false)
  const datePickerRef = useRef<HTMLInputElement>(null)
  type MenuLayout = 'stacked' | 'focus' | 'calendar'
  const [layout, setLayout] = useState<MenuLayout>(() => {
    return (localStorage.getItem('planeat-menu-layout') as MenuLayout) ?? 'stacked'
  })

  const changeLayout = (next: MenuLayout) => {
    setLayout(next)
    localStorage.setItem('planeat-menu-layout', next)
  }

  const goToPrevWeek = () => setCurrentWeek(prev => shiftWeek(prev, -1))
  const goToNextWeek = () => setCurrentWeek(prev => shiftWeek(prev, 1))

  const toggleMealType = (mt: MealType) => {
    setActiveMealTypes(prev => {
      if (prev.includes(mt)) {
        if (prev.length <= 1) return prev // Keep at least one
        return prev.filter(t => t !== mt)
      }
      // Insert in correct order
      const all: MealType[] = ['breakfast', 'lunch', 'snack', 'dinner']
      return all.filter(t => prev.includes(t) || t === mt)
    })
  }

  const handleCopyToWeek = async () => {
    if (!copyTarget) return
    const targetDate = new Date(copyTarget + 'T00:00:00')
    const targetMonday = getMonday(targetDate)
    await copyMenuToWeek(targetMonday)
    setShowCopyPicker(false)
    setCopyTarget('')
  }

  return (
    <div className="space-y-4 p-4">
      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <button onClick={goToPrevWeek} className="p-2 text-muted-2 hover:text-ink-2 transition-colors pressable">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center relative">
          <button
            onClick={() => datePickerRef.current?.showPicker()}
            className="text-sm font-bold text-ink hover:text-accent-strong transition-colors"
          >
            {formatWeekRange(currentWeek)}
          </button>
          <input
            ref={datePickerRef}
            type="date"
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            value={formatDate(currentWeek)}
            onChange={e => {
              if (e.target.value) {
                const picked = new Date(e.target.value + 'T00:00:00')
                setCurrentWeek(getMonday(picked))
              }
            }}
          />
        </div>
        <button onClick={goToNextWeek} className="p-2 text-muted-2 hover:text-ink-2 transition-colors pressable">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Meal types config + layout selector */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowMealConfig(!showMealConfig)}
          className="flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink transition-colors pressable"
        >
          <Settings2 className="w-3.5 h-3.5" />
          {t('menu.addSlots')}
        </button>
        <div className="flex items-center gap-0.5 bg-surface-2 rounded-lg p-0.5 border border-line-2">
          {([
            { key: 'stacked' as MenuLayout, icon: LayoutList },
            { key: 'focus' as MenuLayout, icon: CalendarDays },
            { key: 'calendar' as MenuLayout, icon: Grid3X3 },
          ]).map(({ key, icon: Icon }) => (
            <button
              key={key}
              onClick={() => changeLayout(key)}
              className={`p-1.5 rounded-md transition-all pressable ${
                layout === key
                  ? 'bg-surface shadow-sm text-accent-strong'
                  : 'text-muted-2 hover:text-ink'
              }`}
              title={t(`menu.layout${key.charAt(0).toUpperCase() + key.slice(1)}` as 'menu.layoutStacked')}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Meal type selector */}
      {showMealConfig && (
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(ALL_MEAL_TYPES) as MealType[]).map(mt => (
            <button
              key={mt}
              onClick={() => toggleMealType(mt)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors pressable ${
                activeMealTypes.includes(mt)
                  ? 'bg-accent-soft border-accent/30 text-accent-ink'
                  : 'bg-surface border-line text-muted'
              }`}
            >
              {ALL_MEAL_TYPES[mt]}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <WeekGrid
            slots={slots}
            recipes={recipes}
            activeMealTypes={activeMealTypes}
            layout={layout}
            weekStart={currentWeek}
            onSetSlot={setSlot}
            onClearSlot={clearSlot}
            onAddExtra={addExtraRecipe}
            onRemoveExtra={removeExtraRecipe}
            onMaterializeDefault={materializeDefaultRecipe}
          />

          {slots.length > 0 && (
            <button
              onClick={() => setShowCopyPicker(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-line rounded-full text-sm text-ink-2 hover:bg-bg transition-colors pressable"
            >
              <Copy className="w-4 h-4" />
              {t('menu.copyToWeek')}
            </button>
          )}
        </>
      )}

      {/* Copy to week picker modal */}
      {showCopyPicker && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center animate-fade" onClick={() => setShowCopyPicker(false)}>
          <div
            className="bg-surface w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl p-6 space-y-4 animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent" />
              <h3 className="font-bold text-ink">{t('menu.copyTo')}</h3>
            </div>
            <p className="text-sm text-muted">{t('menu.selectDate')}</p>
            <input
              type="date"
              value={copyTarget}
              onChange={e => setCopyTarget(e.target.value)}
              min={formatDate(new Date())}
              className="w-full px-3 py-2.5 border border-line rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCopyToWeek}
                disabled={!copyTarget}
                className="flex-1 px-4 py-2.5 bg-accent text-white rounded-full text-sm font-semibold disabled:opacity-40 hover:bg-accent-strong transition-colors pressable"
              >
                {t('menu.copy')}
              </button>
              <button
                onClick={() => { setShowCopyPicker(false); setCopyTarget('') }}
                className="px-4 py-2.5 border border-line rounded-full text-sm text-ink-2 hover:bg-bg transition-colors pressable"
              >
                {t('menu.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
