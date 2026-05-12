export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { BOOKING_API_BASE } = process.env;
  if (!BOOKING_API_BASE) return Response.json({ error: "Missing config" }, { status: 500 });

  const auth = request.headers.get("Authorization");
  if (!auth) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id) return Response.json({ error: "Missing order id" }, { status: 400 });

  try {
    const res = await fetch(`${BOOKING_API_BASE}/api/orders/${id}`, {
      headers: { Authorization: auth },
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
