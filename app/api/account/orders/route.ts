export async function GET(request: Request) {
  const { BOOKING_API_BASE } = process.env;
  if (!BOOKING_API_BASE) return Response.json({ error: "Missing config" }, { status: 500 });

  const auth = request.headers.get("Authorization");
  if (!auth) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const customerId = url.searchParams.get("customerId");
  const eventId = url.searchParams.get("eventId");

  if (!customerId && !eventId) {
    return Response.json({ error: "Missing customerId or eventId" }, { status: 400 });
  }

  const params = new URLSearchParams();
  if (customerId) params.set("customerId", customerId);
  if (eventId) params.set("eventId", eventId);

  try {
    const res = await fetch(
      `${BOOKING_API_BASE}/api/orders?${params.toString()}`,
      {
        headers: { Authorization: auth },
        cache: "no-store",
      }
    );
    const text = await res.text();
    let data: unknown;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
    return Response.json(data, { status: res.status });
  } catch {
    return Response.json({ error: "Upstream unreachable" }, { status: 502 });
  }
}
