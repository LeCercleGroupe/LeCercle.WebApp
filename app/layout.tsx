import type { Metadata } from 'next'
import { Geist, Geist_Mono, Figtree, EB_Garamond, Dancing_Script, Cinzel, Cinzel_Decorative } from 'next/font/google'
import { headers } from 'next/headers'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const figtree = Figtree({
  variable: '--font-figtree',
  subsets: ['latin'],
})

const ebGaramond = EB_Garamond({
  variable: '--font-eb-garamond',
  subsets: ['latin'],
})

const dancingScript = Dancing_Script({
  variable: '--font-dancing-script',
  subsets: ['latin'],
  weight: ['700'],
})

const cinzel = Cinzel({
  variable: '--font-cinzel',
  subsets: ['latin'],
  weight: ['400', '700', '900'],
})

const cinzelDecorative = Cinzel_Decorative({
  variable: '--font-cinzel-deco',
  subsets: ['latin'],
  weight: ['700'],
})

export const metadata: Metadata = {
  title: 'Le Circle',
  description: 'Servicii create pentru evenimente memorabile.',
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const headersList = await headers()
  const locale = headersList.get('x-locale') ?? 'ro'

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${figtree.variable} ${ebGaramond.variable} ${dancingScript.variable} ${cinzel.variable} ${cinzelDecorative.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
