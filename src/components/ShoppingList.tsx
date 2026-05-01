import { useState } from 'react'
import {
  Check, Copy, Share2, ChevronDown,
  Beef, Fish, Milk, Leaf, Apple, GlassWater,
  Wheat, Package, Flame, Circle,
} from 'lucide-react'
import { getCategory, CATEGORIES, CATEGORY_META } from '../lib/categories'
import { shareList } from '../lib/share'
import { useI18n } from '../lib/i18n'
import type { LucideIcon } from 'lucide-react'

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  beef: Beef,
  fish: Fish,
  milk: Milk,
  leaf: Leaf,
  apple: Apple,
  'glass-water': GlassWater,
  wheat: Wheat,
  package: Package,
  flame: Flame,
  circle: Circle,
}

interface ShoppingListProps {
  ingredients: string[]
}

export function ShoppingList({ ingredients }: ShoppingListProps) {
  const { t } = useI18n()
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState(false)
  const [shared, setShared] = useState(false)

  const toggleItem = (item: string) => {
    const next = new Set(checked)
    if (next.has(item)) next.delete(item)
    else next.add(item)
    setChecked(next)
  }

  const toggleCollapse = (category: string) => {
    const next = new Set(collapsed)
    if (next.has(category)) next.delete(category)
    else next.add(category)
    setCollapsed(next)
  }

  const handleCopy = async () => {
    const text = ingredients.map(i => `- ${i}`).join('\n')
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    const result = await shareList(ingredients)
    if (result === 'shared' || result === 'copied') {
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    }
  }

  if (ingredients.length === 0) {
    return (
      <div className="text-center py-12 text-muted">
        <p className="text-sm">{t('shopping.noItems')}</p>
        <p className="text-xs mt-1 text-muted-2">{t('shopping.addRecipes')}</p>
      </div>
    )
  }

  // Group ingredients by category
  const grouped: Record<string, string[]> = {}
  for (const item of ingredients) {
    const category = getCategory(item)
    if (!grouped[category]) grouped[category] = []
    grouped[category].push(item)
  }

  const sortedCategories = CATEGORIES.filter(cat => grouped[cat] && grouped[cat].length > 0)
  const progress = ingredients.length > 0 ? Math.round((checked.size / ingredients.length) * 100) : 0

  return (
    <div className="space-y-3">
      {/* Progress - circular like v2 prototype */}
      <div className="bg-surface rounded-2xl border border-line p-4 flex items-center gap-4 shadow-[var(--shadow-card)]">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
          style={{
            background: `conic-gradient(var(--color-accent) ${progress * 3.6}deg, var(--color-line) 0)`,
          }}
        >
          <div className="w-9 h-9 rounded-full bg-surface flex items-center justify-center text-xs font-bold text-ink">
            {progress}%
          </div>
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-ink">
            {checked.size} / {ingredients.length} {t('shopping.products')}
          </div>
          <div className="text-xs text-muted mt-0.5">
            {progress === 100 ? 'Lista completa!' : 'De las comidas de esta semana'}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-line rounded-full text-sm text-ink-2 hover:bg-bg transition-colors pressable"
        >
          <Copy className="w-4 h-4" />
          {copied ? t('shopping.copied') : t('shopping.copyList')}
        </button>
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-accent text-white rounded-full text-sm font-semibold hover:bg-accent-strong transition-colors pressable"
        >
          <Share2 className="w-4 h-4" />
          {shared ? t('shopping.sent') : t('shopping.share')}
        </button>
      </div>

      {/* Category sections */}
      <div className="space-y-3">
        {sortedCategories.map(category => {
          const meta = CATEGORY_META[category] ?? CATEGORY_META['Otros']
          const IconComponent = CATEGORY_ICONS[meta.icon] ?? Circle
          const isCollapsed = collapsed.has(category)
          const items = grouped[category]
          const checkedCount = items.filter(i => checked.has(i)).length

          return (
            <div key={category} className="bg-surface rounded-2xl border border-line overflow-hidden shadow-[var(--shadow-card)]">
              {/* Category header */}
              <button
                onClick={() => toggleCollapse(category)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 border-b border-line-2 transition-colors pressable ${meta.bgColor}`}
              >
                <IconComponent className={`w-4.5 h-4.5 ${meta.color}`} />
                <span className={`text-xs font-bold uppercase tracking-wider flex-1 text-left ${meta.color}`}>
                  {category}
                </span>
                <span className="text-xs text-muted">
                  {checkedCount}/{items.length}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-muted transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`}
                />
              </button>

              {/* Items */}
              {!isCollapsed && (
                <div className="divide-y divide-line-2">
                  {items.map(item => (
                    <button
                      key={item}
                      onClick={() => toggleItem(item)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-bg transition-colors pressable"
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          checked.has(item) ? 'bg-accent border-accent' : 'border-muted-2'
                        }`}
                      >
                        {checked.has(item) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span
                        className={`text-sm transition-opacity ${
                          checked.has(item) ? 'text-muted line-through opacity-40' : 'text-ink'
                        }`}
                      >
                        {item}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
