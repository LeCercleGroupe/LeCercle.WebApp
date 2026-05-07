export async function GET(
  request: Request,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  const { serviceId } = await params;

  const auth = request.headers.get("authorization");
  if (!auth) return Response.json({ error: "Missing authorization" }, { status: 401 });

  const { BOOKING_API_BASE } = process.env;
  if (!BOOKING_API_BASE) return Response.json({ error: "Missing API base URL" }, { status: 500 });


  const res = await fetch(`${BOOKING_API_BASE}/api/services/${serviceId}/packages`, {
    headers: { Authorization: auth },
    cache: "no-store",
  });

  const text = await res.text();

  if (!res.ok) return Response.json({ error: `Upstream error: ${res.statusText}` }, { status: res.status });

  return Response.json(JSON.parse(text));
}
