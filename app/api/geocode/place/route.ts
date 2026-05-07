export interface PlaceDetails {
  latitude: number;
  longitude: number;
  postcode: string;
}

interface PlacesDetailsResponse {
  location?: { latitude: number; longitude: number };
  addressComponents?: Array<{
    types: string[];
    longText: string;
  }>;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id")?.trim();

  if (!id) return Response.json(null, { status: 400 });

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return Response.json(null, { status: 500 });


  const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(id)}`, {
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "location,addressComponents",
    },
    cache: "no-store",
  });


  if (!res.ok) return Response.json(null, { status: 502 });

  const data: PlacesDetailsResponse = await res.json();
  if (!data.location) return Response.json(null, { status: 404 });

  const postcode =
    data.addressComponents?.find((c) => c.types.includes("postal_code"))?.longText ?? "";

  const result: PlaceDetails = {
    latitude: data.location.latitude,
    longitude: data.location.longitude,
    postcode,
  };

  return Response.json(result);
}
