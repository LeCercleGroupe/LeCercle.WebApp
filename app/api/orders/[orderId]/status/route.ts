import { upstreamFetch } from "@/app/api/_lib/authCookie";

// PATCH /api/orders/{orderId}/status
// Updates a single order's status (e.g. Cancelled, Confirmed).
// Auth: RequireManager — enforced upstream via the forwarded access token.
// Body: { id: string, status: string }  →  Response: 204 No Content
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { BOOKING_API_BASE } = process.env;
  if (!BOOKING_API_BASE) return Response.json({ error: "Missing config" }, { status: 500 });

  const { orderId } = await params;

  let body: { id?: string; status?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!body.status) return Response.json({ error: "Missing status" }, { status: 400 });

  const res = await upstreamFetch(`${BOOKING_API_BASE}/api/orders/${orderId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: body.id ?? orderId, status: body.status }),
    cache: "no-store",
  });

  if (res.status === 204) return new Response(null, { status: 204 });

  const text = await res.text();
  let data: unknown;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  return Response.json(data, { status: res.status });
}
