const CATEGORY_MAP: Record<string, string> = {
  // Carnes
  pollo: 'Carnes',
  'pechuga de pollo': 'Carnes',
  ternera: 'Carnes',
  'filetes de ternera': 'Carnes',
  cerdo: 'Carnes',
  'lomo de cerdo': 'Carnes',
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
  morcilla: 'Carnes',
  lacon: 'Carnes',

  // Pescados
  salmon: 'Pescados',
  atun: 'Pescados',
  'atun fresco': 'Pescados',
  merluza: 'Pescados',
  gambas: 'Pescados',
  bacalao: 'Pescados',
  sardinas: 'Pescados',
  mejillones: 'Pescados',
  calamares: 'Pescados',
  calamar: 'Pescados',
  pulpo: 'Pescados',
  langostinos: 'Pescados',
  pescado: 'Pescados',

  // Lacteos
  leche: 'Lacteos',
  queso: 'Lacteos',
  'queso rallado': 'Lacteos',
  'queso parmesano': 'Lacteos',
  quesitos: 'Lacteos',
  yogur: 'Lacteos',
  nata: 'Lacteos',
  mantequilla: 'Lacteos',
  'nata para cocinar': 'Lacteos',
  huevos: 'Lacteos',
  huevo: 'Lacteos',

  // Verduras
  tomate: 'Verduras',
  tomates: 'Verduras',
  'tomate cherry': 'Verduras',
  cebolla: 'Verduras',
  ajo: 'Verduras',
  patatas: 'Verduras',
  patata: 'Verduras',
  lechuga: 'Verduras',
  pimiento: 'Verduras',
  pimientos: 'Verduras',
  'pimiento rojo': 'Verduras',
  'pimiento verde': 'Verduras',
  zanahoria: 'Verduras',
  zanahorias: 'Verduras',
  calabacin: 'Verduras',
  berenjena: 'Verduras',
  pepino: 'Verduras',
  champiñones: 'Verduras',
  champinones: 'Verduras',
  espinacas: 'Verduras',
  brocoli: 'Verduras',
  guisantes: 'Verduras',
  judias: 'Verduras',
  'judias verdes': 'Verduras',
  maiz: 'Verduras',
  aceitunas: 'Verduras',
  perejil: 'Verduras',
  alcachofa: 'Verduras',
  esparragos: 'Verduras',
  calabaza: 'Verduras',
  albahaca: 'Verduras',
  setas: 'Verduras',
  puerros: 'Verduras',
  quinoa: 'Verduras',

  // Frutas
  limon: 'Frutas',
  aguacate: 'Frutas',
  platano: 'Frutas',
  manzana: 'Frutas',
  naranja: 'Frutas',
  frutas: 'Frutas',

  // Bebidas
  'leche de coco': 'Bebidas',
  zumo: 'Bebidas',
  agua: 'Bebidas',
  cerveza: 'Bebidas',
  vino: 'Bebidas',

  // Pasta y Cereales
  macarrones: 'Pasta y Cereales',
  espaguetis: 'Pasta y Cereales',
  pasta: 'Pasta y Cereales',
  arroz: 'Pasta y Cereales',
  pan: 'Pasta y Cereales',
  'pan rallado': 'Pasta y Cereales',
  'pan tostado': 'Pasta y Cereales',
  'pan de hamburguesa': 'Pasta y Cereales',
  'pan de molde': 'Pasta y Cereales',
  cuscus: 'Pasta y Cereales',
  granola: 'Pasta y Cereales',
  'tortillas de maiz': 'Pasta y Cereales',
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
  fabes: 'Conservas',

  // Especias y Condimentos
  oregano: 'Especias y Condimentos',
  comino: 'Especias y Condimentos',
  pimenton: 'Especias y Condimentos',
  curry: 'Especias y Condimentos',
  guindilla: 'Especias y Condimentos',
  pinones: 'Especias y Condimentos',
  salsa: 'Especias y Condimentos',
  'salsa de soja': 'Especias y Condimentos',
  mayonesa: 'Especias y Condimentos',
  mostaza: 'Especias y Condimentos',
  ketchup: 'Especias y Condimentos',
  vinagre: 'Especias y Condimentos',
  'aceite de oliva': 'Especias y Condimentos',
}

export const CATEGORIES = [
  'Carnes',
  'Pescados',
  'Lacteos',
  'Verduras',
  'Frutas',
  'Bebidas',
  'Pasta y Cereales',
  'Conservas',
  'Especias y Condimentos',
  'Otros',
] as const

export const CATEGORY_META: Record<string, { color: string; bgColor: string; icon: string }> = {
  'Carnes':                 { color: 'text-red-600',    bgColor: 'bg-red-50',    icon: 'beef' },
  'Pescados':               { color: 'text-blue-600',   bgColor: 'bg-blue-50',   icon: 'fish' },
  'Lacteos':                { color: 'text-amber-700',  bgColor: 'bg-amber-50',  icon: 'milk' },
  'Verduras':               { color: 'text-green-600',  bgColor: 'bg-green-50',  icon: 'leaf' },
  'Frutas':                 { color: 'text-yellow-600', bgColor: 'bg-yellow-50', icon: 'apple' },
  'Bebidas':                { color: 'text-purple-600', bgColor: 'bg-purple-50', icon: 'glass-water' },
  'Pasta y Cereales':       { color: 'text-orange-700', bgColor: 'bg-orange-50', icon: 'wheat' },
  'Conservas':              { color: 'text-slate-600',  bgColor: 'bg-slate-50',  icon: 'package' },
  'Especias y Condimentos': { color: 'text-orange-600', bgColor: 'bg-orange-50', icon: 'flame' },
  'Otros':                  { color: 'text-slate-500',  bgColor: 'bg-slate-50',  icon: 'circle' },
}

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
