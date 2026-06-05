import { upstreamFetch } from "@/app/api/_lib/authCookie";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { BOOKING_API_BASE } = process.env;
  if (!BOOKING_API_BASE) return Response.json({ error: "Missing config" }, { status: 500 });

  const { id } = await params;
  const body = await request.text();

  const res = await upstreamFetch(`${BOOKING_API_BASE}/api/events/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body,
    cache: "no-store",
  });

  if (res.status === 204) return new Response(null, { status: 204 });

  const text = await res.text();
  let data: unknown;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  return Response.json(data, { status: res.status });
}
