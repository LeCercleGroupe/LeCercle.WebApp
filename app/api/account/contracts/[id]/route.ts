export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { BOOKING_API_BASE } = process.env;
  if (!BOOKING_API_BASE) return Response.json({ error: "Missing config" }, { status: 500 });

  const auth = request.headers.get("Authorization");
  if (!auth) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id: orderId } = await params;

  try {
    const res = await fetch(
      `${BOOKING_API_BASE}/api/contracts?orderId=${encodeURIComponent(orderId)}`,
      { headers: { Authorization: auth }, cache: "no-store" }
    );
    const text = await res.text();
    let data: unknown;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
    return Response.json(data, { status: res.status });
  } catch (err) {
    console.error("[contracts/orderId] upstream error:", err);
    return Response.json({ error: "Upstream unreachable" }, { status: 502 });
  }
}
