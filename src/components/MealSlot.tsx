import { Plus, X } from 'lucide-react'
import type { MenuSlot as MenuSlotType } from '../types'

interface MealSlotProps {
  label: string
  slot: MenuSlotType | undefined
  isEditing: boolean
  onEdit: () => void
  onClear: () => void
}

export function MealSlot({ label, slot, onEdit, onClear }: MealSlotProps) {
  const mealName = slot?.recipe?.name ?? slot?.custom_meal

  return (
    <div className="p-3 min-h-[60px] flex flex-col">
      <span className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">{label}</span>
      {mealName ? (
        <div className="flex items-start justify-between gap-1">
          <button
            onClick={onEdit}
            className="text-sm text-slate-700 text-left hover:text-green-600 transition-colors flex-1"
          >
            {mealName}
          </button>
          <button
            onClick={onClear}
            className="text-slate-300 hover:text-red-400 transition-colors shrink-0 mt-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          onClick={onEdit}
          className="flex items-center gap-1 text-sm text-slate-300 hover:text-green-500 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Anadir</span>
        </button>
      )}
    </div>
  )
}
