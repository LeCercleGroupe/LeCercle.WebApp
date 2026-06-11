import { NextResponse } from "next/server";

const COOKIE_ACCESS  = "lc_access";
const COOKIE_REFRESH = "lc_refresh";

// Read the `exp` claim from a JWT so the cookie expires exactly when the
// token does, regardless of what `expiresIn` the API reports.
function jwtMaxAge(token: string, fallbackSeconds: number): number {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
    if (typeof payload.exp === "number") {
      const secs = payload.exp - Math.floor(Date.now() / 1000);
      if (secs > 0) return secs;
    }
  } catch {}
  return fallbackSeconds;
}

export async function POST(request: Request) {
  const auth = request.headers.get("authorization");
  if (!auth) return NextResponse.json({ error: "Missing authorization" }, { status: 401 });

  const { BOOKING_API_BASE } = process.env;
  if (!BOOKING_API_BASE) return NextResponse.json({ error: "Missing API base URL" }, { status: 500 });

  const body = await request.json();

  const res = await fetch(`${BOOKING_API_BASE}/api/otp/verify`, {
    method:  "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body:    JSON.stringify(body),
    cache:   "no-store",
  });

  if (!res.ok)
    return NextResponse.json({ error: `Upstream error: ${res.statusText}` }, { status: res.status });

  const data = await res.json();

  // Normalise camelCase and snake_case — upstream may use either.
  const accessToken  = data.accessToken  ?? data.access_token  ?? null;
  const refreshToken = data.refreshToken ?? data.refresh_token ?? null;
  const expiresIn    = data.expiresIn    ?? data.expires_in    ?? 3600;

  // Strip all token fields before sending the response body to the browser.
  const {
    accessToken:  _a,  access_token:  _at,
    refreshToken: _r,  refresh_token: _rt,
    expiresIn:    _e,  expires_in:    _ei,
    ...safeData
  } = data;

  const accessMaxAge = accessToken ? jwtMaxAge(accessToken, expiresIn) : expiresIn;

  // Expose the real expiry as a plain timestamp so the client can align
  // localStorage's profileExpiresAt with the actual token lifetime.
  const responseBody = { ...safeData, sessionExpiresAt: Date.now() + accessMaxAge * 1000 };
  const response = NextResponse.json(responseBody);

  if (accessToken) {
    const secure = process.env.NODE_ENV === "production";
    const base = { httpOnly: true, secure, sameSite: "lax" as const, path: "/" };
    response.cookies.set(COOKIE_ACCESS,  accessToken,  { ...base, maxAge: accessMaxAge });
    if (refreshToken) {
      response.cookies.set(COOKIE_REFRESH, refreshToken, { ...base, maxAge: jwtMaxAge(refreshToken, 30 * 24 * 60 * 60) });
    }
  }

  return response;
}
