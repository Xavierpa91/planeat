import { useState } from 'react'
import { ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react'
import { ShoppingList } from '../components/ShoppingList'
import { useMenu } from '../hooks/useMenu'
import { getMonday, shiftWeek, formatWeekRange } from '../lib/week'
import { useI18n } from '../lib/i18n'

interface ShoppingPageProps {
  householdId: string
}

export function ShoppingPage({ householdId }: ShoppingPageProps) {
  const [currentWeek, setCurrentWeek] = useState(() => getMonday())
  const { loading, getWeekIngredients } = useMenu(householdId, currentWeek)
  const { t } = useI18n()
  const [showChart, setShowChart] = useState(false)

  const ingredients = getWeekIngredients()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-ink tracking-[-0.02em] font-[family-name:var(--font-display)]">{t('shopping.title')}</h2>
        <button
          onClick={() => setShowChart(!showChart)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors pressable ${showChart ? 'bg-accent-soft text-accent-strong' : 'text-muted-2 hover:text-ink'}`}
        >
          <BarChart3 className="w-4 h-4" />
          {t('shopping.chart')}
        </button>
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentWeek(prev => shiftWeek(prev, -1))}
          className="p-2 text-muted-2 hover:text-ink-2 transition-colors pressable"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-ink-2">
            {formatWeekRange(currentWeek)}
          </span>
          {getMonday().toDateString() !== currentWeek.toDateString() && (
            <button
              onClick={() => setCurrentWeek(getMonday())}
              className="text-[10px] font-semibold text-accent-strong bg-accent-soft px-2 py-0.5 rounded-full pressable hover:bg-accent/20 transition-colors"
            >
              {t('general.today')}
            </button>
          )}
        </div>
        <button
          onClick={() => setCurrentWeek(prev => shiftWeek(prev, 1))}
          className="p-2 text-muted-2 hover:text-ink-2 transition-colors pressable"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <ShoppingList ingredients={ingredients} showChart={showChart} />
      )}
    </div>
  )
}
