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

  // Move tokens to HttpOnly cookies — never expose them to the browser.
  // refreshToken is optional: some upstream configs (client-credentials OTP) only
  // issue an access token. We still set lc_access so the account page works.
  if (data.accessToken) {
    await setAuthCookies(
      data.accessToken,
      data.refreshToken ?? null,
      data.expiresIn ?? 3600,
    );
  }

  // Strip token fields from the response body
  const { accessToken: _a, refreshToken: _r, expiresIn: _e, ...safeData } = data;
  return Response.json(safeData);
}
