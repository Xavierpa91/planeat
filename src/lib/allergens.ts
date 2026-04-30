export interface AllergenInfo {
  id: string
  label: string
  labelEn: string
  icon: string
}

export const ALLERGENS: AllergenInfo[] = [
  { id: 'gluten', label: 'Gluten', labelEn: 'Gluten', icon: '🌾' },
  { id: 'lacteos', label: 'Lacteos', labelEn: 'Dairy', icon: '🥛' },
  { id: 'huevo', label: 'Huevo', labelEn: 'Egg', icon: '🥚' },
  { id: 'pescado', label: 'Pescado', labelEn: 'Fish', icon: '🐟' },
  { id: 'crustaceos', label: 'Crustaceos', labelEn: 'Shellfish', icon: '🦐' },
  { id: 'frutos_secos', label: 'Frutos secos', labelEn: 'Tree nuts', icon: '🥜' },
  { id: 'soja', label: 'Soja', labelEn: 'Soy', icon: '🫘' },
  { id: 'apio', label: 'Apio', labelEn: 'Celery', icon: '🥬' },
  { id: 'mostaza', label: 'Mostaza', labelEn: 'Mustard', icon: '🟡' },
  { id: 'moluscos', label: 'Moluscos', labelEn: 'Molluscs', icon: '🐚' },
]

const ALLERGEN_MAP: Record<string, string[]> = {
  // Gluten
  'harina': ['gluten'],
  'pan': ['gluten'],
  'pan rallado': ['gluten'],
  'pan tostado': ['gluten'],
  'pan de hamburguesa': ['gluten'],
  'pan de molde': ['gluten'],
  'pasta': ['gluten'],
  'espaguetis': ['gluten'],
  'macarrones': ['gluten'],
  'fideos': ['gluten'],
  'tortillas de trigo': ['gluten'],
  'cuscus': ['gluten'],
  'granola': ['gluten'],

  // Lacteos
  'leche': ['lacteos'],
  'queso': ['lacteos'],
  'queso rallado': ['lacteos'],
  'queso parmesano': ['lacteos'],
  'quesitos': ['lacteos'],
  'nata': ['lacteos'],
  'mantequilla': ['lacteos'],
  'yogur': ['lacteos'],

  // Huevo
  'huevos': ['huevo'],
  'huevo': ['huevo'],

  // Pescado
  'salmon': ['pescado'],
  'merluza': ['pescado'],
  'bacalao': ['pescado'],
  'atun fresco': ['pescado'],
  'atun en lata': ['pescado'],
  'sardinas': ['pescado'],

  // Crustaceos
  'gambas': ['crustaceos'],
  'langostinos': ['crustaceos'],

  // Moluscos
  'calamares': ['moluscos'],
  'calamar': ['moluscos'],
  'pulpo': ['moluscos'],
  'mejillones': ['moluscos'],

  // Frutos secos
  'pinones': ['frutos_secos'],
  'almendras': ['frutos_secos'],
  'nueces': ['frutos_secos'],

  // Soja
  'salsa de soja': ['soja'],
  'soja': ['soja'],

  // Apio
  'apio': ['apio'],

  // Mostaza
  'mostaza': ['mostaza'],
}

export function detectAllergens(ingredients: string[]): string[] {
  const detected = new Set<string>()

  for (const ingredient of ingredients) {
    const normalized = ingredient.trim().toLowerCase()

    // Exact match
    if (ALLERGEN_MAP[normalized]) {
      for (const a of ALLERGEN_MAP[normalized]) detected.add(a)
      continue
    }

    // Partial match
    for (const [key, allergens] of Object.entries(ALLERGEN_MAP)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        for (const a of allergens) detected.add(a)
      }
    }
  }

  return [...detected]
}

export function getAllergenInfo(id: string): AllergenInfo | undefined {
  return ALLERGENS.find(a => a.id === id)
}
