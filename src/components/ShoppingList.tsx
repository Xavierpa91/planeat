import { useState } from 'react'
import { Check, Copy, ExternalLink } from 'lucide-react'
import { formatShoppingList } from '../lib/bring'

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
    // Open Bring! app via deep link with current page
    const url = encodeURIComponent(window.location.href)
    window.open(`https://api.getbring.com/rest/bringrecipes/deeplink?url=${url}&source=web`, '_blank')
  }

  if (ingredients.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p className="text-sm">No hay ingredientes en el menu de esta semana</p>
        <p className="text-xs mt-1">Anade recetas con ingredientes al menu</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <Copy className="w-4 h-4" />
          {copied ? 'Copiado!' : 'Copiar lista'}
        </button>
        <button
          onClick={handleBring}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Enviar a Bring!
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        {ingredients.map(item => (
          <button
            key={item}
            onClick={() => toggleItem(item)}
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
          >
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                checked.has(item) ? 'bg-green-500 border-green-500' : 'border-slate-300'
              }`}
            >
              {checked.has(item) && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className={`text-sm ${checked.has(item) ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
              {item}
            </span>
          </button>
        ))}
      </div>

      <p className="text-xs text-slate-400 text-center">
        {checked.size} de {ingredients.length} completados
      </p>
    </div>
  )
}
