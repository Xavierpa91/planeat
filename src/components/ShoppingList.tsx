import { useState } from 'react'
import {
  Check, Copy, Share2, ChevronDown, Plus, X,
  Beef, Fish, Milk, Leaf, Apple, GlassWater,
  Wheat, Package, Flame, Circle, CheckCheck, Trash2,
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
  showChart?: boolean
}

export function ShoppingList({ ingredients, showChart }: ShoppingListProps) {
  const { t } = useI18n()
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState(false)
  const [shared, setShared] = useState(false)
  const [extraItems, setExtraItems] = useState<string[]>([])
  const [removedItems, setRemovedItems] = useState<Set<string>>(new Set())
  const [newItem, setNewItem] = useState('')

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

  const addItem = () => {
    const trimmed = newItem.trim()
    if (!trimmed) return
    const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()
    if (!allItems.includes(capitalized)) {
      setExtraItems(prev => [...prev, capitalized])
    }
    setNewItem('')
  }

  const removeItem = (item: string) => {
    if (extraItems.includes(item)) {
      setExtraItems(prev => prev.filter(i => i !== item))
    } else {
      setRemovedItems(prev => new Set(prev).add(item))
    }
    // Also remove from checked
    const next = new Set(checked)
    next.delete(item)
    setChecked(next)
  }

  // Combine ingredients + extras - removed
  const allItems = [
    ...ingredients.filter(i => !removedItems.has(i)),
    ...extraItems,
  ]

  const handleCopy = async () => {
    const text = allItems.map(i => `- ${i}`).join('\n')
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    const result = await shareList(allItems)
    if (result === 'shared' || result === 'copied') {
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    }
  }

  if (allItems.length === 0 && extraItems.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center py-12 text-muted">
          <p className="text-sm">{t('shopping.noItems')}</p>
          <p className="text-xs mt-1 text-muted-2">{t('shopping.addRecipes')}</p>
        </div>
        {/* Allow adding items even when empty */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newItem}
            onChange={e => setNewItem(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
            placeholder={t('shopping.addItemPlaceholder')}
            className="flex-1 px-3 py-2 border border-line rounded-xl text-sm bg-surface-2 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            onClick={addItem}
            disabled={!newItem.trim()}
            className="px-3 py-2 bg-accent text-white rounded-xl text-sm font-semibold disabled:opacity-40 pressable"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  // Group items by category
  const grouped: Record<string, string[]> = {}
  for (const item of allItems) {
    const category = getCategory(item)
    if (!grouped[category]) grouped[category] = []
    grouped[category].push(item)
  }

  const sortedCategories = CATEGORIES.filter(cat => grouped[cat] && grouped[cat].length > 0)
  const progress = allItems.length > 0 ? Math.round((checked.size / allItems.length) * 100) : 0

  return (
    <div className="space-y-3">
      {/* Category chart */}
      {showChart && sortedCategories.length > 0 && (
        <div className="bg-surface rounded-2xl border border-line p-4 space-y-3 shadow-[var(--shadow-card)] animate-pop">
          <h3 className="text-sm font-bold text-ink">{t('shopping.chartTitle')}</h3>
          <div className="space-y-2">
            {sortedCategories.map(category => {
              const meta = CATEGORY_META[category] ?? CATEGORY_META['Otros']
              const count = grouped[category].length
              const pct = Math.round((count / allItems.length) * 100)
              const IconComponent = CATEGORY_ICONS[meta.icon] ?? Circle

              return (
                <div key={category} className="flex items-center gap-2">
                  <IconComponent className={`w-4 h-4 shrink-0 ${meta.color}`} />
                  <span className="text-xs text-ink w-20 shrink-0 truncate">{category}</span>
                  <div className="flex-1 h-5 bg-line-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: `var(--color-accent)`,
                        opacity: 0.6 + (pct / 250),
                      }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-muted w-10 text-right">{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Progress - circular */}
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
            {checked.size} / {allItems.length} {t('shopping.products')}
          </div>
          <div className="text-xs text-muted mt-0.5">
            {progress === 100 ? 'Lista completa!' : 'De las comidas de esta semana'}
          </div>
        </div>
      </div>

      {/* Add item input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addItem()}
          placeholder={t('shopping.addItemPlaceholder')}
          className="flex-1 px-3 py-2 border border-line rounded-xl text-sm bg-surface-2 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          onClick={addItem}
          disabled={!newItem.trim()}
          className="px-3 py-2 bg-accent text-white rounded-xl text-sm font-semibold disabled:opacity-40 pressable"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Select all / Clear all */}
      <div className="flex gap-2">
        <button
          onClick={() => setChecked(new Set(allItems))}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 border border-line rounded-full text-xs font-semibold text-ink-2 hover:bg-bg transition-colors pressable"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          {t('shopping.selectAll')}
        </button>
        <button
          onClick={() => setChecked(new Set())}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 border border-line rounded-full text-xs font-semibold text-ink-2 hover:bg-bg transition-colors pressable"
        >
          <Trash2 className="w-3.5 h-3.5" />
          {t('shopping.clearAll')}
        </button>
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
                    <div
                      key={item}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-bg transition-colors"
                    >
                      <button
                        onClick={() => toggleItem(item)}
                        className="flex items-center gap-3 flex-1"
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
                          {extraItems.includes(item) && (
                            <span className="ml-1.5 text-[10px] text-accent-strong font-semibold">manual</span>
                          )}
                        </span>
                      </button>
                      <button
                        onClick={() => removeItem(item)}
                        className="text-muted-2 hover:text-danger transition-colors shrink-0 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
