export async function POST(request: Request) {
  const { BOOKING_API_BASE } = process.env;
  if (!BOOKING_API_BASE) return Response.json({ error: "Missing config" }, { status: 500 });

  const auth = request.headers.get("Authorization");
  if (!auth) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  let res: Response;
  try {
    res = await fetch(`${BOOKING_API_BASE}/api/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: auth },
      body: JSON.stringify(body),
    });
  } catch (error) {
    console.error("[api/booking/event] fetch failed:", error);
    return Response.json({ error: "Upstream unreachable" }, { status: 502 });
  }

  const text = await res.text();

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  return Response.json(data, { status: res.status });
}
