import { upstreamFetch } from "@/app/api/_lib/authCookie";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { BOOKING_API_BASE } = process.env;
  if (!BOOKING_API_BASE) return Response.json({ error: "Missing config" }, { status: 500 });

  const { id: orderId } = await params;

  const res = await upstreamFetch(
    `${BOOKING_API_BASE}/api/contracts?orderId=${encodeURIComponent(orderId)}`,
    { cache: "no-store" },
  );

  const text = await res.text();
  let data: unknown;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  return Response.json(data, { status: res.status });
}
