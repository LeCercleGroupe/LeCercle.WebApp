import { getAccessToken } from "@/app/api/_lib/authCookie";
import { getM2MToken } from "@/app/api/_lib/m2m";

export async function POST(request: Request) {
  const { BOOKING_API_BASE } = process.env;
  if (!BOOKING_API_BASE) return Response.json({ error: "Missing config" }, { status: 500 });

  const body = await request.text();

  // Prefer the customer's own token (satisfies RequireCustomer).
  // When lc_access is absent (isAddOrder flow or expired mid-session) fall
  // back to the M2M booking token so the call still reaches the upstream.
  const customerToken = await getAccessToken();
  let token: string;
  if (customerToken) {
    token = customerToken;
  } else {
    try {
      token = await getM2MToken();
    } catch {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const res = await fetch(`${BOOKING_API_BASE}/api/promocodes/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body,
    cache: "no-store",
  });

  const text = await res.text();
  let data: unknown;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  return Response.json(data, { status: res.status });
}
