const COMPANY_LAT = 47.040081;
const COMPANY_LNG = 28.742557;

interface DistanceMatrixResponse {
  status: string;
  rows: Array<{
    elements: Array<{
      status: string;
      distance: { text: string; value: number };
      duration: { text: string; value: number };
    }>;
  }>;
}

export interface DistanceResult {
  distanceKm: number;
  distanceText: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const destination = searchParams.get("destination")?.trim();

  if (!destination) return Response.json(null, { status: 400 });

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return Response.json(null, { status: 500 });

  const url = new URL("https://maps.googleapis.com/maps/api/distancematrix/json");
  url.searchParams.set("origins", `${COMPANY_LAT},${COMPANY_LNG}`);
  url.searchParams.set("destinations", destination);
  url.searchParams.set("mode", "driving");
  url.searchParams.set("language", "ro");
  url.searchParams.set("key", apiKey);


  const res = await fetch(url.toString(), { cache: "no-store" });
  const text = await res.text();

  if (!res.ok) return Response.json(null, { status: 502 });

  const data: DistanceMatrixResponse = JSON.parse(text);
  const element = data.rows?.[0]?.elements?.[0];

  if (!element || element.status !== "OK") {
    return Response.json(null, { status: 404 });
  }

  const result: DistanceResult = {
    distanceKm: parseFloat((element.distance.value / 1000).toFixed(1)),
    distanceText: element.distance.text,
  };

  return Response.json(result);
}
