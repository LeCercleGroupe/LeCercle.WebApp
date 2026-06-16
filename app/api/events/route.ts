import { employeeUpstreamFetch } from "@/app/api/_lib/entraUpstream";

// GET /api/events?status=&serviceId=&customerId=
// Employee-facing events listing. Proxies to the booking API with the employee
// (Entra) bearer token. The upstream enforces roles — e.g. customerId is only
// honoured for Owner/Manager.
export async function GET(request: Request) {
  const { BOOKING_API_BASE } = process.env;
  if (!BOOKING_API_BASE) return Response.json({ error: "Missing config" }, { status: 500 });

  const url = new URL(request.url);
  const forwarded = new URLSearchParams();
  for (const key of ["status", "serviceId", "customerId"]) {
    const value = url.searchParams.get(key);
    if (value) forwarded.set(key, value);
  }
  const suffix = forwarded.toString() ? `?${forwarded}` : "";

  const res = await employeeUpstreamFetch(`${BOOKING_API_BASE}/api/events${suffix}`, { cache: "no-store" });

  const text = await res.text();
  let data: unknown;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  return Response.json(data, { status: res.status });
}
