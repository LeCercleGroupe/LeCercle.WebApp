import { getM2MToken } from "@/app/api/_lib/m2m";

export async function POST(request: Request) {
  const { BOOKING_API_BASE } = process.env;
  if (!BOOKING_API_BASE) return Response.json({ error: "Missing config" }, { status: 500 });

  const body = await request.json();

  let token: string;
  try {
    token = await getM2MToken();
  } catch (err) {
    return Response.json({ error: "Auth failed" }, { status: 502 });
  }

  const payload = { ...body, callbackUrl: `${BOOKING_API_BASE}/api/payments/webhook` };

  let res: Response;
  try {
    res = await fetch(`${BOOKING_API_BASE}/api/payments/initiate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("[payment] upstream unreachable:", err);
    return Response.json({ error: "Payment service temporarily unavailable" }, { status: 503 });
  }

  const text = await res.text();
  console.log(`[payment] status=${res.status} body=`, text);

  let data: unknown;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }

  return Response.json(data, { status: res.status });
}
