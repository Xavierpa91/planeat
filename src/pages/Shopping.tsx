import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ShoppingList } from '../components/ShoppingList'
import { useMenu } from '../hooks/useMenu'
import { getMonday, shiftWeek, formatWeekRange } from '../lib/week'

interface ShoppingPageProps {
  householdId: string
}

export function ShoppingPage({ householdId }: ShoppingPageProps) {
  const [currentWeek, setCurrentWeek] = useState(() => getMonday())
  const { loading, getWeekIngredients } = useMenu(householdId, currentWeek)

  const ingredients = getWeekIngredients()

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">Lista de compra</h2>

      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentWeek(prev => shiftWeek(prev, -1))}
          className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-medium text-slate-600">
          {formatWeekRange(currentWeek)}
        </span>
        <button
          onClick={() => setCurrentWeek(prev => shiftWeek(prev, 1))}
          className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <ShoppingList ingredients={ingredients} />
      )}
    </div>
  )
}
