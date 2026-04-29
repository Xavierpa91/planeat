import { useState } from 'react'
import { ChevronLeft, ChevronRight, Copy } from 'lucide-react'
import { WeekGrid } from '../components/WeekGrid'
import { useMenu } from '../hooks/useMenu'
import { useRecipes } from '../hooks/useRecipes'
import { getMonday, shiftWeek, formatWeekRange } from '../lib/week'

interface MenuPageProps {
  householdId: string
}

export function MenuPage({ householdId }: MenuPageProps) {
  const [currentWeek, setCurrentWeek] = useState(() => getMonday())
  const { slots, loading, setSlot, clearSlot, copyMenuToWeek } = useMenu(householdId, currentWeek)
  const { recipes } = useRecipes(householdId)

  const goToPrevWeek = () => setCurrentWeek(prev => shiftWeek(prev, -1))
  const goToNextWeek = () => setCurrentWeek(prev => shiftWeek(prev, 1))
  const goToCurrentWeek = () => setCurrentWeek(getMonday())

  const handleCopyToNextWeek = async () => {
    const nextWeek = shiftWeek(currentWeek, 1)
    await copyMenuToWeek(nextWeek)
  }

  return (
    <div className="space-y-4">
      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <button onClick={goToPrevWeek} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <button
            onClick={goToCurrentWeek}
            className="text-sm font-semibold text-slate-700 hover:text-green-600 transition-colors"
          >
            {formatWeekRange(currentWeek)}
          </button>
        </div>
        <button onClick={goToNextWeek} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <WeekGrid
            slots={slots}
            recipes={recipes}
            onSetSlot={setSlot}
            onClearSlot={clearSlot}
          />

          {slots.length > 0 && (
            <button
              onClick={handleCopyToNextWeek}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-500 hover:bg-slate-50 transition-colors"
            >
              <Copy className="w-4 h-4" />
              Copiar menu a la semana siguiente
            </button>
          )}
        </>
      )}
    </div>
  )
}
