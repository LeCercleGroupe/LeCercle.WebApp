import { upstreamFetch } from "@/app/api/_lib/authCookie";

export async function POST(request: Request) {
  const { BOOKING_API_BASE } = process.env;
  if (!BOOKING_API_BASE) return Response.json({ error: "Missing config" }, { status: 500 });

  const body = await request.json();
  const { eventId } = body;
  if (!eventId) return Response.json({ error: "Missing eventId" }, { status: 400 });

  const res = await upstreamFetch(`${BOOKING_API_BASE}/api/events/${eventId}/orders`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });

  const text = await res.text();
  let data: unknown;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  return Response.json(data, { status: res.status });
}
