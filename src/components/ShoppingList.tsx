import { useState } from 'react'
import { Check, Copy, ExternalLink } from 'lucide-react'
import { formatShoppingList } from '../lib/bring'
import { getCategory, CATEGORIES } from '../lib/categories'

interface ShoppingListProps {
  ingredients: string[]
}

export function ShoppingList({ ingredients }: ShoppingListProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState(false)

  const toggleItem = (item: string) => {
    const next = new Set(checked)
    if (next.has(item)) next.delete(item)
    else next.add(item)
    setChecked(next)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(formatShoppingList(ingredients))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleBring = () => {
    const url = encodeURIComponent(window.location.href)
    window.open(`https://api.getbring.com/rest/bringrecipes/deeplink?url=${url}&source=web`, '_blank')
  }

  if (ingredients.length === 0) {
    return (
      <div className="text-center py-12 text-muted">
        <p className="text-sm">No hay ingredientes en el menu de esta semana</p>
        <p className="text-xs mt-1 text-muted-2">Anade recetas con ingredientes al menu</p>
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

  // Sort categories by predefined order
  const sortedCategories = CATEGORIES.filter(cat => grouped[cat] && grouped[cat].length > 0)

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-line rounded-full text-sm text-ink-2 hover:bg-bg transition-colors pressable"
        >
          <Copy className="w-4 h-4" />
          {copied ? 'Copiado!' : 'Copiar lista'}
        </button>
        <button
          onClick={handleBring}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-accent text-white rounded-full text-sm font-semibold hover:bg-accent-strong transition-colors pressable"
        >
          <ExternalLink className="w-4 h-4" />
          Enviar a Bring!
        </button>
      </div>

      <div className="space-y-3">
        {sortedCategories.map(category => (
          <div key={category} className="bg-surface rounded-2xl border border-line overflow-hidden">
            <div className="px-4 py-2 border-b border-line-2">
              <span className="text-xs font-bold text-muted uppercase tracking-wider">{category}</span>
            </div>
            <div className="divide-y divide-line-2">
              {grouped[category].map(item => (
                <button
                  key={item}
                  onClick={() => toggleItem(item)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-bg transition-colors pressable"
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      checked.has(item) ? 'bg-accent border-accent' : 'border-muted-2'
                    }`}
                  >
                    {checked.has(item) && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`text-sm ${checked.has(item) ? 'text-muted line-through' : 'text-ink'}`}>
                    {item}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted text-center">
        {checked.size} de {ingredients.length} completados
      </p>
    </div>
  )
}
