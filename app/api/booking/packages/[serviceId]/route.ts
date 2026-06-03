import { getM2MToken } from "@/app/api/_lib/m2m";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  const { serviceId } = await params;

  const { BOOKING_API_BASE } = process.env;
  if (!BOOKING_API_BASE) return Response.json({ error: "Missing API base URL" }, { status: 500 });

  let token: string;
  try {
    token = await getM2MToken();
  } catch {
    return Response.json({ error: "Failed to acquire M2M token" }, { status: 502 });
  }

  const res = await fetch(`${BOOKING_API_BASE}/api/services/${serviceId}/packages`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const text = await res.text();

  if (!res.ok) return Response.json({ error: `Upstream error: ${res.statusText}` }, { status: res.status });

  return Response.json(JSON.parse(text));
}
