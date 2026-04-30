import { getCategory, CATEGORIES } from './categories'

const CATEGORY_EMOJI: Record<string, string> = {
  'Carnes': '🥩',
  'Pescados': '🐟',
  'Lacteos': '🧀',
  'Verduras': '🥬',
  'Frutas': '🍎',
  'Bebidas': '🥤',
  'Pasta y Cereales': '🌾',
  'Conservas': '🥫',
  'Especias y Condimentos': '🌶️',
  'Otros': '📦',
}

export function formatShareList(ingredients: string[]): string {
  const grouped: Record<string, string[]> = {}
  for (const item of ingredients) {
    const cat = getCategory(item)
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(item)
  }

  const lines: string[] = ['🛒 Lista de compra - PlanEat', '']
  for (const cat of CATEGORIES) {
    if (!grouped[cat]?.length) continue
    lines.push(`${CATEGORY_EMOJI[cat] ?? '📦'} ${cat}`)
    for (const item of grouped[cat]) {
      lines.push(`  ☐ ${item}`)
    }
    lines.push('')
  }
  return lines.join('\n').trim()
}

export async function shareList(ingredients: string[]): Promise<'shared' | 'copied' | 'failed'> {
  const text = formatShareList(ingredients)

  if (navigator.share) {
    try {
      await navigator.share({ title: 'Lista de compra', text })
      return 'shared'
    } catch {
      // User cancelled or share failed, fall through to clipboard
    }
  }

  try {
    await navigator.clipboard.writeText(text)
    return 'copied'
  } catch {
    return 'failed'
  }
}
