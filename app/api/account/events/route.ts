import { upstreamFetch } from "@/app/api/_lib/authCookie";

export async function GET(request: Request) {
  const { BOOKING_API_BASE } = process.env;
  if (!BOOKING_API_BASE) return Response.json({ error: "Missing config" }, { status: 500 });

  const url = new URL(request.url);
  const customerId = url.searchParams.get("customerId");
  if (!customerId) return Response.json({ error: "Missing customerId" }, { status: 400 });

  const res = await upstreamFetch(
    `${BOOKING_API_BASE}/api/events/customer/${encodeURIComponent(customerId)}`,
    { cache: "no-store" },
  );

  const text = await res.text();
  let data: unknown;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  return Response.json(data, { status: res.status });
}
