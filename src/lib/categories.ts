const CATEGORY_MAP: Record<string, string> = {
  // Carnes
  pollo: 'Carnes',
  ternera: 'Carnes',
  cerdo: 'Carnes',
  jamon: 'Carnes',
  'jamon serrano': 'Carnes',
  chorizo: 'Carnes',
  salchichas: 'Carnes',
  carne: 'Carnes',
  'carne picada': 'Carnes',
  bacon: 'Carnes',
  pavo: 'Carnes',
  lomo: 'Carnes',
  costillas: 'Carnes',

  // Pescados
  salmon: 'Pescados',
  atun: 'Pescados',
  merluza: 'Pescados',
  gambas: 'Pescados',
  bacalao: 'Pescados',
  sardinas: 'Pescados',
  mejillones: 'Pescados',
  calamares: 'Pescados',
  langostinos: 'Pescados',
  pescado: 'Pescados',

  // Lacteos
  leche: 'Lacteos',
  queso: 'Lacteos',
  'queso rallado': 'Lacteos',
  'queso parmesano': 'Lacteos',
  yogur: 'Lacteos',
  nata: 'Lacteos',
  mantequilla: 'Lacteos',
  'nata para cocinar': 'Lacteos',
  huevos: 'Lacteos',
  huevo: 'Lacteos',

  // Frutas y Verduras
  tomate: 'Frutas y Verduras',
  tomates: 'Frutas y Verduras',
  cebolla: 'Frutas y Verduras',
  ajo: 'Frutas y Verduras',
  patatas: 'Frutas y Verduras',
  patata: 'Frutas y Verduras',
  lechuga: 'Frutas y Verduras',
  pimiento: 'Frutas y Verduras',
  pimientos: 'Frutas y Verduras',
  'pimiento rojo': 'Frutas y Verduras',
  'pimiento verde': 'Frutas y Verduras',
  zanahoria: 'Frutas y Verduras',
  zanahorias: 'Frutas y Verduras',
  calabacin: 'Frutas y Verduras',
  berenjena: 'Frutas y Verduras',
  pepino: 'Frutas y Verduras',
  champiñones: 'Frutas y Verduras',
  champinones: 'Frutas y Verduras',
  espinacas: 'Frutas y Verduras',
  brocoli: 'Frutas y Verduras',
  guisantes: 'Frutas y Verduras',
  limon: 'Frutas y Verduras',
  aguacate: 'Frutas y Verduras',
  platano: 'Frutas y Verduras',
  manzana: 'Frutas y Verduras',
  naranja: 'Frutas y Verduras',
  judias: 'Frutas y Verduras',
  'judias verdes': 'Frutas y Verduras',
  maiz: 'Frutas y Verduras',
  aceitunas: 'Frutas y Verduras',
  perejil: 'Frutas y Verduras',

  // Pasta y Cereales
  macarrones: 'Pasta y Cereales',
  espaguetis: 'Pasta y Cereales',
  pasta: 'Pasta y Cereales',
  arroz: 'Pasta y Cereales',
  pan: 'Pasta y Cereales',
  'pan rallado': 'Pasta y Cereales',
  'pan tostado': 'Pasta y Cereales',
  harina: 'Pasta y Cereales',
  fideos: 'Pasta y Cereales',
  tortillas: 'Pasta y Cereales',
  'tortillas de trigo': 'Pasta y Cereales',

  // Conservas
  'tomate frito': 'Conservas',
  'tomate triturado': 'Conservas',
  'atun en lata': 'Conservas',
  garbanzos: 'Conservas',
  lentejas: 'Conservas',
  alubias: 'Conservas',

  // Especias y Condimentos
  oregano: 'Especias y Condimentos',
  comino: 'Especias y Condimentos',
  pimenton: 'Especias y Condimentos',
  curry: 'Especias y Condimentos',
  salsa: 'Especias y Condimentos',
  'salsa de soja': 'Especias y Condimentos',
  mayonesa: 'Especias y Condimentos',
  mostaza: 'Especias y Condimentos',
  ketchup: 'Especias y Condimentos',
  vinagre: 'Especias y Condimentos',
}

export const CATEGORIES = [
  'Carnes',
  'Pescados',
  'Lacteos',
  'Frutas y Verduras',
  'Pasta y Cereales',
  'Conservas',
  'Especias y Condimentos',
  'Otros',
] as const

export function getCategory(ingredientName: string): string {
  const normalized = ingredientName.trim().toLowerCase()

  // Exact match first
  if (CATEGORY_MAP[normalized]) return CATEGORY_MAP[normalized]

  // Partial match: check if the ingredient contains a known key
  for (const [key, category] of Object.entries(CATEGORY_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return category
    }
  }

  return 'Otros'
}
