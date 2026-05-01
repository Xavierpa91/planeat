import { Plus, X } from 'lucide-react'
import { FoodIcon, guessIcon } from './FoodIcon'
import { useI18n } from '../lib/i18n'
import type { MenuSlot as MenuSlotType } from '../types'

interface MealSlotProps {
  label: string
  slot: MenuSlotType | undefined
  isEditing: boolean
  onEdit: () => void
  onClear: () => void
  onAddExtra?: () => void
  onRemoveExtra?: (extraId: string) => void
}

export function MealSlot({ label, slot, onEdit, onClear, onAddExtra, onRemoveExtra }: MealSlotProps) {
  const { t } = useI18n()
  const mealName = slot?.recipe?.name ?? slot?.custom_meal
  const recipeIcon = slot?.recipe?.icon ?? (mealName ? guessIcon(mealName) : undefined)
  const extras = slot?.extra_recipes ?? []

  return (
    <div className="p-3 min-h-[60px] flex flex-col">
      <span className="text-[10px] uppercase tracking-wider text-muted-2 mb-1">{label}</span>
      {mealName ? (
        <div className="flex flex-col gap-1">
          {/* Primary recipe */}
          <div className="flex items-start justify-between gap-1">
            <button
              onClick={onEdit}
              className="text-sm text-ink text-left hover:text-accent-strong transition-colors flex-1 flex items-center gap-1.5"
            >
              {recipeIcon && <FoodIcon kind={recipeIcon} size={16} />}
              <span>{mealName}</span>
            </button>
            <button
              onClick={onClear}
              className="text-muted-2 hover:text-danger transition-colors shrink-0 mt-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Extra recipes */}
          {extras.map(extra => {
            const extraIcon = extra.recipe?.icon ?? (extra.recipe?.name ? guessIcon(extra.recipe.name) : undefined)
            return (
              <div key={extra.id} className="flex items-start justify-between gap-1">
                <span className="text-sm text-ink flex items-center gap-1.5 flex-1">
                  {extraIcon && <FoodIcon kind={extraIcon} size={16} />}
                  {extra.recipe?.name}
                </span>
                {onRemoveExtra && (
                  <button
                    onClick={() => onRemoveExtra(extra.id)}
                    className="text-muted-2 hover:text-danger transition-colors shrink-0 mt-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )
          })}

          {/* Add extra button */}
          {onAddExtra && (
            <button
              onClick={onAddExtra}
              className="flex items-center gap-1 text-xs text-muted-2 hover:text-accent transition-colors mt-0.5"
            >
              <Plus className="w-3 h-3" />
              <span>{t('menu.extraDish')}</span>
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={onEdit}
          className="flex items-center gap-1 text-sm text-muted-2 hover:text-accent transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{t('menu.add')}</span>
        </button>
      )}
    </div>
  )
}
