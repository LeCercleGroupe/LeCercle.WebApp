export interface AddressSuggestion {
  label: string;
  placeId: string;
}

interface PlacesAutocompleteResponse {
  suggestions?: Array<{
    placePrediction?: {
      placeId: string;
      text?: { text: string };
      structuredFormat?: {
        mainText?: { text: string };
        secondaryText?: { text: string };
      };
    };
  }>;
}

async function queryPlaces(
  input: string,
  apiKey: string,
  primaryTypes?: string[]
): Promise<AddressSuggestion[]> {
  const body: Record<string, unknown> = {
    input,
    includedRegionCodes: ["md"],
    languageCode: "ro",
  };
  if (primaryTypes) body.includedPrimaryTypes = primaryTypes;

  const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) return [];

  const data: PlacesAutocompleteResponse = await res.json();
  const suggestions: AddressSuggestion[] = [];
  const seen = new Set<string>();

  for (const s of data.suggestions ?? []) {
    const p = s.placePrediction;
    if (!p?.placeId) continue;
    const label = p.structuredFormat?.mainText?.text ?? p.text?.text ?? "";
    if (!label || seen.has(label)) continue;
    seen.add(label);
    suggestions.push({ label, placeId: p.placeId });
    if (suggestions.length >= 6) break;
  }

  return suggestions;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const city = searchParams.get("city")?.trim();
  const type = searchParams.get("type")?.trim();

  if (!q || q.length < 2) return Response.json([]);

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return Response.json([]);

  if (type === "city") {
    const results = await queryPlaces(q, apiKey, ["locality", "administrative_area_level_2"]);
    return Response.json(results);
  }

  if (type === "venue") {
    const input = city ? `${q}, ${city}, Moldova` : `${q}, Moldova`;
    const results = await queryPlaces(input, apiKey, [
      "restaurant", "cafe", "bar", "hotel", "event_venue",
    ]);
    return Response.json(results);
  }

  const input = city ? `${q}, ${city}` : q;
  const results = await queryPlaces(input, apiKey);
  return Response.json(results);
}
