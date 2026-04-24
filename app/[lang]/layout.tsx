import { notFound } from 'next/navigation'
import { hasLocale, locales } from './dictionaries'

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export default async function LangLayout({
  children,
  params,
}: LayoutProps<'/[lang]'>) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  return <>{children}</>
}
