import { upstreamFetch } from "@/app/api/_lib/authCookie";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { BOOKING_API_BASE } = process.env;
  if (!BOOKING_API_BASE) return Response.json({ error: "Missing config" }, { status: 500 });

  const { id } = await params;

  const res = await upstreamFetch(`${BOOKING_API_BASE}/api/events/${id}/cancel`, {
    method: "PATCH",
    cache: "no-store",
  });

  if (res.status === 204) return new Response(null, { status: 204 });

  const text = await res.text();
  let data: unknown;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  return Response.json(data, { status: res.status });
}
