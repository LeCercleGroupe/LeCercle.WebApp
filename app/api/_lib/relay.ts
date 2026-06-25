// Relays an upstream booking-API response back to the browser, preserving the
// status. 204 / empty bodies are passed through as-is; otherwise the JSON body
// is forwarded (falling back to a `{ raw }` wrapper for non-JSON payloads).
export async function relayUpstream(res: Response): Promise<Response> {
  if (res.status === 204) return new Response(null, { status: 204 });

  const text = await res.text();
  if (!text) return new Response(null, { status: res.status });

  let data: unknown;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  return Response.json(data, { status: res.status });
}
