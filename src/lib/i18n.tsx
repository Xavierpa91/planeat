import { createContext, useContext, useState, type ReactNode } from 'react'

export type Locale = 'es' | 'en'
const STORAGE_KEY = 'planeat-locale'

// Translations type
type Translations = Record<string, string>

// Import translations
import { es } from './translations/es'
import { en } from './translations/en'

const TRANSLATIONS: Record<Locale, Translations> = { es, en }

// Get/set locale from localStorage
export function getLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'en' || stored === 'es') return stored
  return 'es'
}

export function setStoredLocale(locale: Locale) {
  localStorage.setItem(STORAGE_KEY, locale)
}

// Context
interface I18nContextType {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType>({
  locale: 'es',
  setLocale: () => {},
  t: (key) => key,
})

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getLocale)

  const setLocale = (l: Locale) => {
    setLocaleState(l)
    setStoredLocale(l)
  }

  const t = (key: string): string => {
    return TRANSLATIONS[locale][key] ?? TRANSLATIONS['es'][key] ?? key
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}
