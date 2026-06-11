import { setAuthCookies } from "@/app/api/_lib/authCookie";

export async function POST(request: Request) {
  const auth = request.headers.get("authorization");
  if (!auth) return Response.json({ error: "Missing authorization" }, { status: 401 });

  const { BOOKING_API_BASE } = process.env;
  if (!BOOKING_API_BASE) return Response.json({ error: "Missing API base URL" }, { status: 500 });

  const body = await request.json();

  const res = await fetch(`${BOOKING_API_BASE}/api/otp/verify`, {
    method:  "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body:    JSON.stringify(body),
    cache:   "no-store",
  });

  if (!res.ok)
    return Response.json({ error: `Upstream error: ${res.statusText}` }, { status: res.status });

  const data = await res.json();

  // Upstream may return either camelCase or snake_case — normalise both.
  const accessToken  = data.accessToken  ?? data.access_token  ?? null;
  const refreshToken = data.refreshToken ?? data.refresh_token ?? null;
  const expiresIn    = data.expiresIn    ?? data.expires_in    ?? 3600;

  if (accessToken) {
    await setAuthCookies(accessToken, refreshToken, expiresIn);
  }

  // Strip all token fields (both casings) before sending the response to the browser.
  const {
    accessToken:  _a,  access_token:  _at,
    refreshToken: _r,  refresh_token: _rt,
    expiresIn:    _e,  expires_in:    _ei,
    ...safeData
  } = data;

  return Response.json(safeData);
}
