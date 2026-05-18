export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  if (!date) return Response.json({ error: "Missing date" }, { status: 400 });

  const auth = request.headers.get("authorization");
  if (!auth) return Response.json({ error: "Missing authorization" }, { status: 401 });

  const { BOOKING_API_BASE } = process.env;
  if (!BOOKING_API_BASE) return Response.json({ error: "Missing API base URL" }, { status: 500 });


  let res: Response;
  try {
    res = await fetch(`${BOOKING_API_BASE}/api/services/availability?date=${date}`, {
      headers: { Authorization: auth },
      cache: "no-store",
    });
  } catch (err) {
    console.error("[services] upstream unreachable:", err);
    return Response.json({ error: "Service temporarily unavailable" }, { status: 503 });
  }

  const text = await res.text();

  if (!res.ok) return Response.json({ error: `Upstream error: ${res.statusText}` }, { status: res.status });

  return Response.json(JSON.parse(text));
}
