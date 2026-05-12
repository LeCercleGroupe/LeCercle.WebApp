export async function POST(request: Request) {
  const { BOOKING_API_BASE } = process.env;
  if (!BOOKING_API_BASE) return Response.json({ error: "Missing config" }, { status: 500 });

  const body = await request.json();

  try {
    const res = await fetch(`${BOOKING_API_BASE}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const text = await res.text();
    let data: unknown;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
    return Response.json(data, { status: res.status });
  } catch {
    return Response.json({ error: "Upstream unreachable" }, { status: 502 });
  }
}
