import { notFound } from 'next/navigation'
import LeCircleHero from '@/components/MainHero/LeCircleHero'
import { getDictionary, hasLocale } from './dictionaries'

export default async function Page({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const dict = await getDictionary(lang)

  return (
    <main>
      <LeCircleHero dict={dict} locale={lang} />
    </main>
  )
}
