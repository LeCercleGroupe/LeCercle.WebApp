import type { MetadataRoute } from 'next'

const BASE_URL = 'https://lecerclegroupe.md'

const locales = ['ro', 'en', 'ru'] as const
const venues = ['laperle', 'lebureau', 'maisondufeu'] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  // Home page for each locale
  const homePages: MetadataRoute.Sitemap = locales.map((locale) => ({
    url: `${BASE_URL}/${locale}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: 1,
    alternates: {
      languages: Object.fromEntries(
        locales.map((l) => [l, `${BASE_URL}/${l}`])
      ),
    },
  }))

  // Venue pages for each locale
  const venuePages: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    venues.map((venue) => ({
      url: `${BASE_URL}/${locale}/${venue}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${BASE_URL}/${l}/${venue}`])
        ),
      },
    }))
  )

  return [...homePages, ...venuePages]
}
