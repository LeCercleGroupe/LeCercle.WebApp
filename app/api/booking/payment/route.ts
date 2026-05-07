async function getM2MToken(): Promise<string> {
  const { BOOKING_CLIENT_ID, BOOKING_CLIENT_SECRET, BOOKING_SCOPE, BOOKING_TOKEN_URL } = process.env;
  const res = await fetch(BOOKING_TOKEN_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: BOOKING_CLIENT_ID!,
      client_secret: BOOKING_CLIENT_SECRET!,
      scope: BOOKING_SCOPE!,
    }),
    cache: "no-store",
  });
  const { access_token } = await res.json();
  return access_token;
}

export async function POST(request: Request) {
  const { BOOKING_API_BASE } = process.env;
  if (!BOOKING_API_BASE) return Response.json({ error: "Missing config" }, { status: 500 });

  const body = await request.json();

  let token: string;
  try {
    token = await getM2MToken();
  } catch (err) {
    return Response.json({ error: "Auth failed" }, { status: 502 });
  }

  const payload = { ...body, callbackUrl: `${BOOKING_API_BASE}/api/payments/webhook` };

  const res = await fetch(`${BOOKING_API_BASE}/api/payments/initiate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

  const text = await res.text();

  let data: unknown;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }

  return Response.json(data, { status: res.status });
}
