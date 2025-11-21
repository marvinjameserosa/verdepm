import { NextResponse } from "next/server";

interface CoordinateResult {
  lat: number;
  lng: number;
  label: string;
}

interface RoutePayload {
  startQuery: string;
  endQuery: string;
}

type LatLngTuple = [number, number];

const NOMINATIM_USER_AGENT =
  process.env.NOMINATIM_USER_AGENT?.trim() ||
  "verdepm-frontend/1.0 (contact: jheredmiguelrepublica14@gmail.com)";

const fetchWithTimeout = async (
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs: number,
  timeoutMessage: string
) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(input, {
      ...init,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(timeoutMessage);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
};

const fetchWithRetry = async (
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs: number,
  timeoutMessage: string,
  retries: number = 2
) => {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fetchWithTimeout(input, init, timeoutMs, timeoutMessage);
    } catch (error) {
      lastError = error;
      console.warn(
        `Attempt ${attempt + 1} failed for ${input.toString()}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );

      if (attempt < retries) {
        const delay = 1000 * (attempt + 1); // Linear backoff: 1s, 2s...
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};

const isValidLatitude = (value: number) => value >= -90 && value <= 90;
const isValidLongitude = (value: number) => value >= -180 && value <= 180;

const tryParseCoordinate = (query: string): CoordinateResult | null => {
  const normalized = query.trim();
  if (!normalized) {
    return null;
  }

  const separators = [",", " "];

  for (const separator of separators) {
    const parts = normalized.split(separator).map((value) => value.trim()).filter(Boolean);
    if (parts.length === 2) {
      const [latRaw, lngRaw] = parts;
      const lat = Number(latRaw);
      const lng = Number(lngRaw);
      if (!Number.isNaN(lat) && !Number.isNaN(lng) && isValidLatitude(lat) && isValidLongitude(lng)) {
        return {
          lat,
          lng,
          label: normalized,
        };
      }
    }
  }

  return null;
};

const geocodeWithNominatim = async (query: string): Promise<CoordinateResult> => {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("addressdetails", "0");
  url.searchParams.set("polygon_geojson", "0");

  const response = await fetchWithRetry(
    url,
    {
      cache: "no-store",
      headers: {
        "User-Agent": NOMINATIM_USER_AGENT,
        "Accept-Language": "en",
      },
    },
    15000,
    "Geocoding request timed out. Please refine the address or try again."
  );

  if (!response.ok) {
    throw new Error(`Geocoding failed with status ${response.status}`);
  }

  const data = (await response.json()) as Array<{
    display_name?: string;
    lat?: string;
    lon?: string;
  }>;

  const feature = data[0];

  if (!feature?.lat || !feature.lon) {
    throw new Error(`No results found for query: ${query}`);
  }

  const lat = Number(feature.lat);
  const lng = Number(feature.lon);

  if (!isValidLatitude(lat) || !isValidLongitude(lng)) {
    throw new Error(`Geocoding returned invalid coordinates for query: ${query}`);
  }

  return {
    lat,
    lng,
    label: feature.display_name ?? query,
  };
};

const resolveCoordinate = async (query: string): Promise<CoordinateResult> => {
  const parsed = tryParseCoordinate(query);
  if (parsed) {
    return parsed;
  }
  return geocodeWithNominatim(query);
};

const requestRoute = async (start: CoordinateResult, end: CoordinateResult) => {
  const coordinates = `${start.lng},${start.lat};${end.lng},${end.lat}`;
  const url = new URL(`https://router.project-osrm.org/route/v1/driving/${coordinates}`);
  url.searchParams.set("overview", "full");
  url.searchParams.set("geometries", "geojson");
  url.searchParams.set("alternatives", "false");
  url.searchParams.set("steps", "false");

  const response = await fetchWithRetry(
    url,
    {
      cache: "no-store",
      headers: {
        "User-Agent": NOMINATIM_USER_AGENT,
      },
    },
    20000,
    "Route planning request timed out. Please try again with different points."
  );

  if (!response.ok) {
    throw new Error(`Directions request failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    code?: string;
    routes?: Array<{
      distance?: number;
      duration?: number;
      geometry?: { coordinates?: Array<[number, number]> };
    }>;
  };

  if (data.code && data.code !== "Ok") {
    throw new Error(`Routing service returned code: ${data.code}`);
  }

  const primaryRoute = data.routes?.[0];
  const geometry = primaryRoute?.geometry?.coordinates ?? [];

  if (!primaryRoute || geometry.length === 0) {
    throw new Error("Unable to compute a driving route between the provided locations.");
  }

  const distanceMeters = primaryRoute.distance ?? 0;
  const durationSeconds = primaryRoute.duration ?? 0;

  const polyline = geometry.map(([lng, lat]) => [lat, lng] as LatLngTuple);

  return {
    distanceKm: Number((distanceMeters / 1000).toFixed(2)),
    durationMinutes: Number((durationSeconds / 60).toFixed(1)),
    polyline,
  };
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RoutePayload | null;
    if (!body) {
      return NextResponse.json({ message: "Request body is required." }, { status: 400 });
    }

    const { startQuery, endQuery } = body;

    if (!startQuery || !endQuery) {
      return NextResponse.json(
        { message: "Both startQuery and endQuery must be provided." },
        { status: 400 }
      );
    }

    const [start, end] = await Promise.all([
      resolveCoordinate(startQuery),
      resolveCoordinate(endQuery),
    ]);

    const route = await requestRoute(start, end);

    return NextResponse.json({
      start,
      end,
      distanceKm: route.distanceKm,
      durationMinutes: route.durationMinutes,
      polyline: route.polyline,
    });
  } catch (error) {
    console.error("Route planning failed", error);
    const message =
      error instanceof Error ? error.message : "Unable to resolve route.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
