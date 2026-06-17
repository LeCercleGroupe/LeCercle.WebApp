import { employeeUpstreamFetch } from "@/app/api/_lib/entraUpstream";

// GET /api/orders/{orderId}?serviceId={serviceId}
// Single order with its items, fixed features and selections. Used by the admin
// panel when an employee opens an event. Proxies to the booking API with the
// employee (Entra) bearer token; the upstream enforces RequireAnyAuthenticated.
// The optional serviceId narrows the order to a single service (admin only).
export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { BOOKING_API_BASE } = process.env;
  if (!BOOKING_API_BASE) return Response.json({ error: "Missing config" }, { status: 500 });

  const { orderId } = await params;
  if (!orderId) return Response.json({ error: "Missing order id" }, { status: 400 });

  const serviceId = new URL(request.url).searchParams.get("serviceId");
  const suffix = serviceId ? `?serviceId=${encodeURIComponent(serviceId)}` : "";

  const res = await employeeUpstreamFetch(
    `${BOOKING_API_BASE}/api/orders/${orderId}${suffix}`,
    { cache: "no-store" },
  );

  const text = await res.text();
  let data: unknown;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  return Response.json(data, { status: res.status });
}
