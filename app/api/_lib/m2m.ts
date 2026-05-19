export async function getM2MToken(): Promise<string> {
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
  if (!res.ok) throw new Error(`M2M token fetch failed: ${res.status}`);
  const { access_token } = await res.json();
  return access_token;
}
