import { useState, useRef } from 'react'
import { ChevronLeft, ChevronRight, Copy, Calendar, LayoutList, CalendarDays, Grid3X3, Home, Trash2, MoreHorizontal, Repeat, X } from 'lucide-react'
import { WeekGrid } from '../components/WeekGrid'
import { useMenu } from '../hooks/useMenu'
import { useRecipes } from '../hooks/useRecipes'
import { supabase } from '../lib/supabase'
import { getMonday, shiftWeek, formatWeekRange, formatDate } from '../lib/week'
import { useI18n } from '../lib/i18n'
import { ALL_MEAL_TYPES, DEFAULT_MEAL_TYPES } from '../types'
import type { MealType } from '../types'

interface MenuPageProps {
  householdId: string
  householdName?: string
}

type ModalAction = 'copy-week' | 'copy-day' | 'copy-month' | 'alternate' | 'clear-week' | 'clear-range' | null

function shiftWeekBy(date: Date, weeks: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + weeks * 7)
  return d
}

export function MenuPage({ householdId, householdName }: MenuPageProps) {
  const [currentWeek, setCurrentWeek] = useState(() => getMonday())
  const { slots, loading, setSlot, clearSlot, addExtraRecipe, removeExtraRecipe, copyMenuToWeek, clearWeek } = useMenu(householdId, currentWeek)
  const { recipes, materializeDefaultRecipe } = useRecipes(householdId)
  const { t, locale } = useI18n()
  const [activeMealTypes, setActiveMealTypes] = useState<MealType[]>(DEFAULT_MEAL_TYPES)
  const datePickerRef = useRef<HTMLInputElement>(null)

  // Layout
  type MenuLayout = 'stacked' | 'focus' | 'calendar'
  const [layout, setLayout] = useState<MenuLayout>(() => {
    return (localStorage.getItem('planeat-menu-layout') as MenuLayout) ?? 'stacked'
  })
  const changeLayout = (next: MenuLayout) => {
    setLayout(next)
    localStorage.setItem('planeat-menu-layout', next)
  }

  // Modal state
  const [showActions, setShowActions] = useState(false)
  const [modalAction, setModalAction] = useState<ModalAction>(null)
  const [targetDate, setTargetDate] = useState('')
  const [targetEndDate, setTargetEndDate] = useState('')
  const [copyDayIndex, setCopyDayIndex] = useState(0)
  const [alternateEvery, setAlternateEvery] = useState(2)
  const [processing, setProcessing] = useState(false)

  const goToPrevWeek = () => setCurrentWeek(prev => shiftWeek(prev, -1))
  const goToNextWeek = () => setCurrentWeek(prev => shiftWeek(prev, 1))

  const toggleMealType = (mt: MealType) => {
    setActiveMealTypes(prev => {
      if (prev.includes(mt)) {
        if (prev.length <= 1) return prev
        return prev.filter(t => t !== mt)
      }
      const all: MealType[] = ['breakfast', 'lunch', 'snack', 'dinner']
      return all.filter(t => prev.includes(t) || t === mt)
    })
  }

  const es = locale === 'es'
  const DAYS_LABEL = es
    ? ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo']
    : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  // ─── Actions ───

  const handleCopyToWeek = async () => {
    if (!targetDate) return
    setProcessing(true)
    const picked = new Date(targetDate + 'T00:00:00')
    await copyMenuToWeek(getMonday(picked))
    setProcessing(false)
    closeModal()
  }

  const handleCopyDayToWeeks = async () => {
    if (!targetEndDate) return
    setProcessing(true)
    const endDate = new Date(targetEndDate + 'T00:00:00')
    let week = shiftWeekBy(currentWeek, 1) // Start from next week

    while (week <= endDate) {
      // Copy only the selected day's slots
      const daySlots = slots.filter(s => s.day_of_week === copyDayIndex)
      if (daySlots.length > 0) {
        const targetStr = formatDate(week)
        let { data: targetMenu } = await supabase
          .from('weekly_menus').select('*').eq('household_id', householdId).eq('week_start', targetStr).single()

        if (!targetMenu) {
          const { data } = await supabase
            .from('weekly_menus').insert({ household_id: householdId, week_start: targetStr }).select().single()
          targetMenu = data
        }

        if (targetMenu) {
          // Delete existing slots for that day
          await supabase
            .from('menu_slots').delete().eq('menu_id', targetMenu.id).eq('day_of_week', copyDayIndex)

          await supabase
            .from('menu_slots').insert(daySlots.map(s => ({
              menu_id: targetMenu.id,
              day_of_week: s.day_of_week,
              meal_type: s.meal_type,
              recipe_id: s.recipe_id,
              custom_meal: s.custom_meal,
            })))
        }
      }
      week = shiftWeekBy(week, 1)
    }
    setProcessing(false)
    closeModal()
  }

  const handleCopyMonth = async () => {
    if (!targetEndDate) return
    setProcessing(true)
    const endDate = new Date(targetEndDate + 'T00:00:00')
    let week = new Date(currentWeek)

    // Get 4 weeks of the current month
    const sourceWeeks: Date[] = []
    for (let i = 0; i < 4; i++) {
      sourceWeeks.push(new Date(week))
      week = shiftWeekBy(week, 1)
    }

    // Copy cyclically until endDate
    let targetWeek = shiftWeekBy(currentWeek, 4)
    let cycleIndex = 0

    while (targetWeek <= endDate) {
      const sourceWeekDate = sourceWeeks[cycleIndex % 4]
      // Temporarily load source week slots
      const sourceStr = formatDate(sourceWeekDate)
  
      const { data: sourceMenu } = await supabase
        .from('weekly_menus').select('id').eq('household_id', householdId).eq('week_start', sourceStr).single()

      if (sourceMenu) {
        const { data: sourceSlots } = await supabase
          .from('menu_slots').select('*').eq('menu_id', sourceMenu.id)

        if (sourceSlots && sourceSlots.length > 0) {
          const targetStr = formatDate(targetWeek)
          let { data: targetMenu } = await supabase
            .from('weekly_menus').select('*').eq('household_id', householdId).eq('week_start', targetStr).single()

          if (!targetMenu) {
            const { data } = await supabase
              .from('weekly_menus').insert({ household_id: householdId, week_start: targetStr }).select().single()
            targetMenu = data
          }

          if (targetMenu) {
            await supabase.from('menu_slots').delete().eq('menu_id', targetMenu.id)
            await supabase.from('menu_slots').insert(sourceSlots.map(s => ({
              menu_id: targetMenu.id,
              day_of_week: s.day_of_week,
              meal_type: s.meal_type,
              recipe_id: s.recipe_id,
              custom_meal: s.custom_meal,
            })))
          }
        }
      }

      targetWeek = shiftWeekBy(targetWeek, 1)
      cycleIndex++
    }
    setProcessing(false)
    closeModal()
  }

  const handleAlternate = async () => {
    if (!targetEndDate) return
    setProcessing(true)
    const endDate = new Date(targetEndDate + 'T00:00:00')
    let week = shiftWeekBy(currentWeek, alternateEvery)


    while (week <= endDate) {
      const targetStr = formatDate(week)
      let { data: targetMenu } = await supabase
        .from('weekly_menus').select('*').eq('household_id', householdId).eq('week_start', targetStr).single()

      if (!targetMenu) {
        const { data } = await supabase
          .from('weekly_menus').insert({ household_id: householdId, week_start: targetStr }).select().single()
        targetMenu = data
      }

      if (targetMenu && slots.length > 0) {
        await supabase.from('menu_slots').delete().eq('menu_id', targetMenu.id)
        await supabase.from('menu_slots').insert(slots.map(s => ({
          menu_id: targetMenu.id,
          day_of_week: s.day_of_week,
          meal_type: s.meal_type,
          recipe_id: s.recipe_id,
          custom_meal: s.custom_meal,
        })))
      }

      week = shiftWeekBy(week, alternateEvery)
    }
    setProcessing(false)
    closeModal()
  }

  const handleClearWeek = async () => {
    if (!confirm(es ? 'Limpiar todo el menu de esta semana?' : 'Clear this week\'s entire menu?')) return
    setProcessing(true)
    await clearWeek()
    setProcessing(false)
    closeModal()
  }

  const handleClearRange = async () => {
    if (!targetEndDate) return
    if (!confirm(es ? `Limpiar menus desde esta semana hasta ${targetEndDate}?` : `Clear menus from this week until ${targetEndDate}?`)) return
    setProcessing(true)
    const endDate = new Date(targetEndDate + 'T00:00:00')
    let week = new Date(currentWeek)


    while (week <= endDate) {
      const weekStr = formatDate(week)
      const { data: menu } = await supabase
        .from('weekly_menus').select('id').eq('household_id', householdId).eq('week_start', weekStr).single()

      if (menu) {
        await supabase.from('menu_slot_recipes').delete()
          .in('slot_id', (await supabase.from('menu_slots').select('id').eq('menu_id', menu.id)).data?.map(s => s.id) ?? [])
        await supabase.from('menu_slots').delete().eq('menu_id', menu.id)
      }
      week = shiftWeekBy(week, 1)
    }
    setProcessing(false)
    closeModal()
  }

  const closeModal = () => {
    setShowActions(false)
    setModalAction(null)
    setTargetDate('')
    setTargetEndDate('')
  }

  return (
    <div className="space-y-4 p-4">
      {/* Household name */}
      {householdName && (
        <div className="flex flex-col items-center gap-1 py-1">
          <Home className="w-6 h-6 text-accent" />
          <span className="text-sm font-bold text-accent-strong">{householdName}</span>
        </div>
      )}

      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <button onClick={goToPrevWeek} className="p-2 text-muted-2 hover:text-ink-2 transition-colors pressable">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
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
              value=""
              onChange={e => {
                if (e.target.value) {
                  const picked = new Date(e.target.value + 'T00:00:00')
                  setCurrentWeek(getMonday(picked))
                  e.target.value = ''
                }
              }}
            />
          </div>
          {getMonday().toDateString() !== currentWeek.toDateString() && (
            <button
              onClick={() => setCurrentWeek(getMonday())}
              className="text-[10px] font-semibold text-accent-strong bg-accent-soft px-2 py-0.5 rounded-full pressable hover:bg-accent/20 transition-colors"
            >
              {t('general.today') ?? 'Hoy'}
            </button>
          )}
        </div>
        <button onClick={goToNextWeek} className="p-2 text-muted-2 hover:text-ink-2 transition-colors pressable">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Meal type pills + layout selector */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1.5 flex-wrap flex-1">
          {(Object.keys(ALL_MEAL_TYPES) as MealType[]).map(mt => (
            <button
              key={mt}
              onClick={() => toggleMealType(mt)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors pressable ${
                activeMealTypes.includes(mt)
                  ? 'bg-accent-soft border-accent/30 text-accent-ink'
                  : 'bg-surface border-line text-muted-2'
              }`}
            >
              {ALL_MEAL_TYPES[mt]}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-0.5 bg-surface-2 rounded-lg p-0.5 border border-line-2 shrink-0">
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

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowActions(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-line rounded-full text-sm text-ink-2 hover:bg-bg transition-colors pressable"
            >
              <MoreHorizontal className="w-4 h-4" />
              {es ? 'Gestionar menu' : 'Manage menu'}
            </button>
            {slots.length > 0 && (
              <button
                onClick={handleClearWeek}
                disabled={processing}
                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-line rounded-full text-sm text-danger hover:bg-bg transition-colors pressable"
              >
                <Trash2 className="w-4 h-4" />
                {es ? 'Limpiar' : 'Clear'}
              </button>
            )}
          </div>
        </>
      )}

      {/* Actions modal */}
      {showActions && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center animate-fade" onClick={closeModal}>
          <div
            className="bg-surface w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl p-5 pb-24 space-y-3 animate-slide-up max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-ink text-base">{es ? 'Gestionar menu' : 'Manage menu'}</h3>
              <button onClick={closeModal} className="text-muted-2 hover:text-ink p-1"><X className="w-5 h-5" /></button>
            </div>

            {!modalAction && (
              <div className="space-y-2">
                {/* Copy options */}
                <p className="text-[10px] uppercase tracking-wider text-muted-2 font-semibold px-1">{es ? 'COPIAR' : 'COPY'}</p>

                <button onClick={() => setModalAction('copy-week')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-line hover:bg-bg transition-colors pressable text-left">
                  <Copy className="w-5 h-5 text-accent shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-ink">{es ? 'Copiar semana a otra fecha' : 'Copy week to another date'}</div>
                    <div className="text-xs text-muted">{es ? 'Copia todo el menu a otra semana' : 'Copy entire menu to another week'}</div>
                  </div>
                </button>

                <button onClick={() => setModalAction('copy-day')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-line hover:bg-bg transition-colors pressable text-left">
                  <Calendar className="w-5 h-5 text-accent shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-ink">{es ? 'Repetir un dia cada semana' : 'Repeat a day every week'}</div>
                    <div className="text-xs text-muted">{es ? 'Ej: copiar el lunes al resto de semanas' : 'E.g. copy Monday to all following weeks'}</div>
                  </div>
                </button>

                <button onClick={() => setModalAction('copy-month')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-line hover:bg-bg transition-colors pressable text-left">
                  <Copy className="w-5 h-5 text-accent shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-ink">{es ? 'Replicar mes completo' : 'Replicate full month'}</div>
                    <div className="text-xs text-muted">{es ? 'Copia las 4 semanas ciclicamente hasta la fecha' : 'Copy 4 weeks cyclically until target date'}</div>
                  </div>
                </button>

                <button onClick={() => setModalAction('alternate')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-line hover:bg-bg transition-colors pressable text-left">
                  <Repeat className="w-5 h-5 text-accent shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-ink">{es ? 'Alternar menu cada X semanas' : 'Alternate menu every X weeks'}</div>
                    <div className="text-xs text-muted">{es ? 'Repite esta semana cada N semanas' : 'Repeat this week every N weeks'}</div>
                  </div>
                </button>

                {/* Clear options */}
                <p className="text-[10px] uppercase tracking-wider text-muted-2 font-semibold px-1 pt-2">{es ? 'LIMPIAR' : 'CLEAR'}</p>

                <button onClick={handleClearWeek}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-line hover:bg-bg transition-colors pressable text-left">
                  <Trash2 className="w-5 h-5 text-danger shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-ink">{es ? 'Limpiar esta semana' : 'Clear this week'}</div>
                    <div className="text-xs text-muted">{es ? 'Elimina todos los platos de la semana actual' : 'Remove all meals from current week'}</div>
                  </div>
                </button>

                <button onClick={() => setModalAction('clear-range')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-line hover:bg-bg transition-colors pressable text-left">
                  <Trash2 className="w-5 h-5 text-danger shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-ink">{es ? 'Limpiar hasta fecha' : 'Clear until date'}</div>
                    <div className="text-xs text-muted">{es ? 'Elimina menus desde esta semana hasta la fecha elegida' : 'Remove menus from this week until chosen date'}</div>
                  </div>
                </button>
              </div>
            )}

            {/* ── Sub-modals ── */}

            {modalAction === 'copy-week' && (
              <div className="space-y-3">
                <p className="text-sm text-muted">{es ? 'Selecciona la semana destino:' : 'Select target week:'}</p>
                <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2.5 border border-line rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                <div className="flex gap-2">
                  <button onClick={handleCopyToWeek} disabled={!targetDate || processing}
                    className="flex-1 px-4 py-2.5 bg-accent text-white rounded-full text-sm font-semibold disabled:opacity-40 pressable">
                    {processing ? '...' : (es ? 'Copiar' : 'Copy')}
                  </button>
                  <button onClick={() => setModalAction(null)}
                    className="px-4 py-2.5 border border-line rounded-full text-sm text-ink-2 pressable">
                    {es ? 'Atras' : 'Back'}
                  </button>
                </div>
              </div>
            )}

            {modalAction === 'copy-day' && (
              <div className="space-y-3">
                <p className="text-sm text-muted">{es ? 'Dia a copiar:' : 'Day to copy:'}</p>
                <div className="flex gap-1 flex-wrap">
                  {DAYS_LABEL.map((day, i) => (
                    <button key={i} onClick={() => setCopyDayIndex(i)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border pressable transition-colors ${
                        copyDayIndex === i ? 'bg-accent text-white border-accent' : 'bg-surface border-line text-muted'
                      }`}>{day.slice(0, 3)}</button>
                  ))}
                </div>
                <p className="text-sm text-muted">{es ? 'Repetir hasta:' : 'Repeat until:'}</p>
                <input type="date" value={targetEndDate} onChange={e => setTargetEndDate(e.target.value)}
                  min={formatDate(currentWeek)}
                  className="w-full px-3 py-2.5 border border-line rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                <div className="flex gap-2">
                  <button onClick={handleCopyDayToWeeks} disabled={!targetEndDate || processing}
                    className="flex-1 px-4 py-2.5 bg-accent text-white rounded-full text-sm font-semibold disabled:opacity-40 pressable">
                    {processing ? '...' : (es ? 'Copiar dia' : 'Copy day')}
                  </button>
                  <button onClick={() => setModalAction(null)}
                    className="px-4 py-2.5 border border-line rounded-full text-sm text-ink-2 pressable">
                    {es ? 'Atras' : 'Back'}
                  </button>
                </div>
              </div>
            )}

            {modalAction === 'copy-month' && (
              <div className="space-y-3">
                <p className="text-sm text-muted">{es ? 'Replica las 4 semanas desde esta fecha ciclicamente hasta:' : 'Replicate the 4 weeks from this date cyclically until:'}</p>
                <input type="date" value={targetEndDate} onChange={e => setTargetEndDate(e.target.value)}
                  min={formatDate(currentWeek)}
                  className="w-full px-3 py-2.5 border border-line rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                <div className="flex gap-2">
                  <button onClick={handleCopyMonth} disabled={!targetEndDate || processing}
                    className="flex-1 px-4 py-2.5 bg-accent text-white rounded-full text-sm font-semibold disabled:opacity-40 pressable">
                    {processing ? '...' : (es ? 'Replicar' : 'Replicate')}
                  </button>
                  <button onClick={() => setModalAction(null)}
                    className="px-4 py-2.5 border border-line rounded-full text-sm text-ink-2 pressable">
                    {es ? 'Atras' : 'Back'}
                  </button>
                </div>
              </div>
            )}

            {modalAction === 'alternate' && (
              <div className="space-y-3">
                <p className="text-sm text-muted">{es ? 'Repetir esta semana cada:' : 'Repeat this week every:'}</p>
                <div className="flex items-center gap-3">
                  <select value={alternateEvery} onChange={e => setAlternateEvery(Number(e.target.value))}
                    className="flex-1 px-3 py-2.5 border border-line rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-surface">
                    {[2, 3, 4].map(n => (
                      <option key={n} value={n}>{n} {es ? 'semanas' : 'weeks'}</option>
                    ))}
                  </select>
                </div>
                <p className="text-sm text-muted">{es ? 'Hasta:' : 'Until:'}</p>
                <input type="date" value={targetEndDate} onChange={e => setTargetEndDate(e.target.value)}
                  min={formatDate(currentWeek)}
                  className="w-full px-3 py-2.5 border border-line rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                <div className="flex gap-2">
                  <button onClick={handleAlternate} disabled={!targetEndDate || processing}
                    className="flex-1 px-4 py-2.5 bg-accent text-white rounded-full text-sm font-semibold disabled:opacity-40 pressable">
                    {processing ? '...' : (es ? 'Alternar' : 'Alternate')}
                  </button>
                  <button onClick={() => setModalAction(null)}
                    className="px-4 py-2.5 border border-line rounded-full text-sm text-ink-2 pressable">
                    {es ? 'Atras' : 'Back'}
                  </button>
                </div>
              </div>
            )}

            {modalAction === 'clear-range' && (
              <div className="space-y-3">
                <p className="text-sm text-muted">{es ? 'Limpiar menus desde esta semana hasta:' : 'Clear menus from this week until:'}</p>
                <input type="date" value={targetEndDate} onChange={e => setTargetEndDate(e.target.value)}
                  min={formatDate(currentWeek)}
                  className="w-full px-3 py-2.5 border border-line rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
                <div className="flex gap-2">
                  <button onClick={handleClearRange} disabled={!targetEndDate || processing}
                    className="flex-1 px-4 py-2.5 bg-danger text-white rounded-full text-sm font-semibold disabled:opacity-40 pressable">
                    {processing ? '...' : (es ? 'Limpiar' : 'Clear')}
                  </button>
                  <button onClick={() => setModalAction(null)}
                    className="px-4 py-2.5 border border-line rounded-full text-sm text-ink-2 pressable">
                    {es ? 'Atras' : 'Back'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
