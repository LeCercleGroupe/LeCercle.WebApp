export async function POST(request: Request) {
  const auth = request.headers.get("authorization");
  if (!auth) return Response.json({ error: "Missing authorization" }, { status: 401 });

  const { BOOKING_API_BASE } = process.env;
  if (!BOOKING_API_BASE) return Response.json({ error: "Missing API base URL" }, { status: 500 });

  const body = await request.json();

  const res = await fetch(`${BOOKING_API_BASE}/api/otp/send`, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const text = await res.text();

  if (!res.ok) return Response.json({ error: `Upstream error: ${res.statusText}` }, { status: res.status });

  let data: unknown;
  try { data = JSON.parse(text); } catch { data = {}; }

  return Response.json(data);
}
