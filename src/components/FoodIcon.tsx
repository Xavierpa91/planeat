interface FoodIconProps {
  kind: string
  size?: number
}

export function FoodIcon({ kind, size = 22 }: FoodIconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  switch (kind) {
    case 'pasta':
      return (
        <svg {...common}>
          <path d="M4 14h16" />
          <path d="M5 14c0-3 1-6 7-6s6 3 6 6" />
          <path d="M8 14v5M12 14v5M16 14v5" />
        </svg>
      )
    case 'salad':
      return (
        <svg {...common}>
          <path d="M3 11h18a9 9 0 0 1-18 0Z" />
          <path d="M7 8c1-2 3-2 4 0M13 7c1-2 3-2 4 0M10 6c0-2 2-3 3-2" />
        </svg>
      )
    case 'chicken':
      return (
        <svg {...common}>
          <path d="M5 19c0-5 3-9 8-9 3 0 6 2 6 5 0 2-1 3-3 4l1 3-3-1-3 1 1-3-3-1c-2-1-4 1-4 1Z" />
        </svg>
      )
    case 'fish':
      return (
        <svg {...common}>
          <path d="M3 12c4-5 9-5 13-3 2 1 3 3 5 3-2 0-3 2-5 3-4 2-9 2-13-3Z" />
          <circle cx="14" cy="11" r=".7" fill="currentColor" />
        </svg>
      )
    case 'soup':
      return (
        <svg {...common}>
          <path d="M3 11h18l-1 6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3Z" />
          <path d="M8 7c1-1 1-2 0-3M12 7c1-1 1-2 0-3M16 7c1-1 1-2 0-3" />
        </svg>
      )
    case 'bowl':
      return (
        <svg {...common}>
          <path d="M3 12h18a8 8 0 0 1-8 8h-2a8 8 0 0 1-8-8Z" />
          <circle cx="9" cy="8" r="1.2" />
          <circle cx="13" cy="6" r="1.2" />
          <circle cx="16" cy="9" r="1.2" />
        </svg>
      )
    case 'pizza':
      return (
        <svg {...common}>
          <path d="M2 9c4-6 16-6 20 0L12 22Z" />
          <circle cx="9" cy="11" r=".9" fill="currentColor" />
          <circle cx="14" cy="12" r=".9" fill="currentColor" />
          <circle cx="11" cy="15" r=".9" fill="currentColor" />
        </svg>
      )
    case 'rice':
      return (
        <svg {...common}>
          <path d="M4 14h16a8 8 0 0 1-8 6 8 8 0 0 1-8-6Z" />
          <path d="M7 11c1-1 1-2 0-3M11 12c1-1 1-2 0-3M15 11c1-1 1-2 0-3" />
        </svg>
      )
    case 'egg':
      return (
        <svg {...common}>
          <path d="M12 3c-4 0-7 6-7 11a7 7 0 0 0 14 0c0-5-3-11-7-11Z" />
        </svg>
      )
    case 'wrap':
      return (
        <svg {...common}>
          <path d="M3 7c4-3 14-3 18 0v10c-4 3-14 3-18 0Z" />
          <path d="M7 8v8M11 8v8M15 8v8" />
        </svg>
      )
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      )
  }
}

export const FOOD_ICONS = ['pasta', 'salad', 'chicken', 'fish', 'soup', 'bowl', 'pizza', 'rice', 'egg', 'wrap'] as const

// Auto-detect icon from recipe name
const ICON_KEYWORDS: Record<string, string[]> = {
  pasta: ['macarron', 'espagueti', 'pasta', 'tallarín', 'fideo', 'lasaña', 'canelón', 'ravioli', 'penne'],
  chicken: ['pollo', 'chicken'],
  fish: ['salmon', 'merluza', 'atun', 'bacalao', 'pescado', 'sardina', 'gamba', 'langostino'],
  salad: ['ensalada', 'salad'],
  soup: ['sopa', 'crema', 'caldo', 'guiso', 'lenteja', 'potaje'],
  pizza: ['pizza'],
  rice: ['arroz', 'paella', 'risotto'],
  egg: ['tortilla', 'huevo', 'revuelto'],
  wrap: ['wrap', 'burrito', 'fajita', 'taco'],
  bowl: ['bowl', 'poke'],
}

export function guessIcon(name: string): string | undefined {
  const lower = name.toLowerCase()
  for (const [icon, keywords] of Object.entries(ICON_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) return icon
  }
  return undefined
}
