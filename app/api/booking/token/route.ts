export async function GET() {
  const { BOOKING_CLIENT_ID, BOOKING_CLIENT_SECRET, BOOKING_SCOPE, BOOKING_TOKEN_URL } = process.env;

  if (!BOOKING_CLIENT_ID || !BOOKING_CLIENT_SECRET || !BOOKING_SCOPE || !BOOKING_TOKEN_URL) {
    return Response.json({ error: "Missing API credentials" }, { status: 500 });
  }


  const res = await fetch(BOOKING_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: BOOKING_CLIENT_ID,
      client_secret: BOOKING_CLIENT_SECRET,
      scope: BOOKING_SCOPE,
    }),
    cache: "no-store",
  });


  if (!res.ok) {
    return Response.json({ error: `Token request failed: ${res.statusText}` }, { status: 502 });
  }

  const { access_token, expires_in } = await res.json();
  return Response.json({ access_token, expires_in });
}
