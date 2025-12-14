import { NextResponse } from "next/server";

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";
const USER_AGENT =
  process.env.NOMINATIM_USER_AGENT ?? "VerdePM Location Picker/1.0";
const CONTACT_EMAIL = process.env.NOMINATIM_CONTACT_EMAIL;

const buildHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    "User-Agent": USER_AGENT,
    "Accept-Language": "en",
  };

  if (CONTACT_EMAIL) {
    headers.From = CONTACT_EMAIL;
  }

  return headers;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const lat = url.searchParams.get("lat");
  const lon = url.searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json(
      { error: "Missing latitude or longitude" },
      { status: 400 }
    );
  }

  try {
    const nominatimUrl = `${NOMINATIM_BASE_URL}/reverse?format=json&lat=${encodeURIComponent(
      lat
    )}&lon=${encodeURIComponent(lon)}&zoom=14&addressdetails=1`;

    const response = await fetch(nominatimUrl, {
      headers: buildHeaders(),
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      const errorPayload = await response.text();
      console.error("Nominatim reverse lookup failed", response.status, errorPayload);
      return NextResponse.json(
        { error: "Reverse geocoding failed" },
        { status: 502 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Location reverse proxy error", error);
    return NextResponse.json(
      { error: "Unable to complete reverse geocoding" },
      { status: 500 }
    );
  }
}
