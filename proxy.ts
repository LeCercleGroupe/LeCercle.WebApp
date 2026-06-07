import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['ro', 'en', 'ru'] as const
type Locale = (typeof locales)[number]
const defaultLocale: Locale = 'ro'

const LC_ACCESS  = 'lc_access'
const LC_REFRESH = 'lc_refresh'

function getPreferredLocale(request: NextRequest): Locale {
  const acceptLanguage = request.headers.get('accept-language')
  if (!acceptLanguage) return defaultLocale
  const preferred = acceptLanguage.split(',')[0].split('-')[0].toLowerCase()
  return (locales as readonly string[]).includes(preferred)
    ? (preferred as Locale)
    : defaultLocale
}

async function tryRefreshToken(
  request: NextRequest,
  lang: string,
): Promise<NextResponse | null> {
  const refreshToken = request.cookies.get(LC_REFRESH)?.value
  if (!refreshToken) return null

  const apiBase = process.env.BOOKING_API_BASE
  if (!apiBase) return null

  try {
    const upstream = await fetch(`${apiBase}/api/auth/refresh`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ refreshToken }),
      cache:   'no-store',
    })

    if (!upstream.ok) {
      const res = NextResponse.redirect(new URL(`/${lang}/account/login`, request.url))
      res.cookies.delete(LC_ACCESS)
      res.cookies.delete(LC_REFRESH)
      return res
    }

    const data = await upstream.json() as {
      accessToken?: string
      refreshToken?: string
      expiresIn?: number
    }

    if (!data.accessToken) {
      const res = NextResponse.redirect(new URL(`/${lang}/account/login`, request.url))
      res.cookies.delete(LC_ACCESS)
      res.cookies.delete(LC_REFRESH)
      return res
    }

    const newAccess  = data.accessToken
    const newRefresh = data.refreshToken ?? refreshToken
    const secure     = process.env.NODE_ENV === 'production'
    const base = { httpOnly: true, secure, sameSite: 'lax' as const, path: '/' }

    // Patch the Cookie header so the server component reads the refreshed token
    // on the same request (cookies() in SC reads the incoming request headers).
    const existing = request.headers.get('cookie') ?? ''
    const stripped = existing
      .split('; ')
      .filter((c) => !c.startsWith(`${LC_ACCESS}=`) && !c.startsWith(`${LC_REFRESH}=`))
      .join('; ')
    const patched = [stripped, `${LC_ACCESS}=${newAccess}`, `${LC_REFRESH}=${newRefresh}`]
      .filter(Boolean)
      .join('; ')

    const reqHeaders = new Headers(request.headers)
    reqHeaders.set('cookie', patched)

    const res = NextResponse.next({ request: { headers: reqHeaders } })
    // Set-Cookie on the response so the browser persists the refreshed tokens.
    res.cookies.set(LC_ACCESS,  newAccess,  { ...base, maxAge: data.expiresIn ?? 3600 })
    res.cookies.set(LC_REFRESH, newRefresh, { ...base, maxAge: 30 * 24 * 60 * 60 })
    return res
  } catch {
    return null
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const pathnameLocale = locales.find(
    (locale) =>
      pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameLocale) {
    const segments = pathname.split('/').filter(Boolean)
    const isAccountRoute = segments[1] === 'account' && segments[2] !== 'login'

    if (isAccountRoute && !request.cookies.get(LC_ACCESS)?.value) {
      const refreshed = await tryRefreshToken(request, pathnameLocale)
      if (refreshed) return refreshed
      // No refresh token either — redirect to login.
      return NextResponse.redirect(new URL(`/${pathnameLocale}/account/login`, request.url))
    }

    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-locale', pathnameLocale)
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  const locale = getPreferredLocale(request)
  const url = request.nextUrl.clone()
  url.pathname = `/${locale}${pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!api|_next|favicon\\.ico|logos|videos|.*\\..*).*)', '/'],
}
