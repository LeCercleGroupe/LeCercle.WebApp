import 'server-only'

const dictionaries = {
  ro: () => import('./dictionaries/ro.json').then((m) => m.default),
  en: () => import('./dictionaries/en.json').then((m) => m.default),
  ru: () => import('./dictionaries/ru.json').then((m) => m.default),
}

export type Locale = keyof typeof dictionaries

export const locales: Locale[] = ['ro', 'en', 'ru']

export const hasLocale = (locale: string): locale is Locale =>
  locale in dictionaries

export const getDictionary = async (locale: Locale) => dictionaries[locale]()
