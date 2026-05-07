export interface VenueSuggestion {
  label: string;
  sublabel: string;
  placeId: string;
  description: string;
  city: string;
}

interface LegacyPrediction {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  terms: Array<{ offset: number; value: string }>;
}

interface LegacyAutocompleteResponse {
  predictions: LegacyPrediction[];
  status: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) return Response.json([]);

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return Response.json([]);

  const url = new URL("https://maps.googleapis.com/maps/api/place/autocomplete/json");
  url.searchParams.set("input", q);
  url.searchParams.set("components", "country:md");
  url.searchParams.set("language", "ro");
  url.searchParams.set("types", "establishment");
  url.searchParams.set("key", apiKey);


  const res = await fetch(url.toString(), { cache: "no-store" });
  const text = await res.text();

  if (!res.ok) return Response.json([]);

  const data: LegacyAutocompleteResponse = JSON.parse(text);
  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    return Response.json([]);
  }

  const suggestions: VenueSuggestion[] = (data.predictions ?? []).slice(0, 6).map((p) => {
    // terms: ["Venue Name", "City", "Moldova"] — city is second-to-last
    const city = p.terms.length >= 2 ? p.terms[p.terms.length - 2].value : "";
    return {
      label: p.structured_formatting.main_text,
      sublabel: p.structured_formatting.secondary_text,
      placeId: p.place_id,
      description: p.description,
      city,
    };
  });

  return Response.json(suggestions);
}
