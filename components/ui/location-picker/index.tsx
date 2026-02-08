"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { LocationSearchInput } from "./location-search-input";

// Dynamically import the map to avoid SSR issues with Leaflet
const LocationMap = dynamic(() => import("./location-map"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-muted animate-pulse rounded-md flex items-center justify-center text-muted-foreground text-sm">
      Loading map...
    </div>
  ),
});

type LocationPickerProps = {
  value: string;
  onChange: (value: string) => void;
  onSave?: () => void;
};

export default function LocationPicker({
  value,
  onChange,
  onSave,
}: LocationPickerProps) {
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize from value (Geocode on load)
  useEffect(() => {
    const initializeLocation = async () => {
      if (!value) {
        setIsInitializing(false);
        return;
      }

      // Check if value is coordinates "lat, lng"
      const parts = value.split(",").map((s) => parseFloat(s.trim()));
      const isCoordinates =
        parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]);

      if (isCoordinates) {
        setLat(parts[0]);
        setLng(parts[1]);
        setIsInitializing(false);
        return;
      }

      // If we already have a position that matches the address (roughly), don't re-fetch
      // This prevents loops if the user is typing
      // But here we are initializing, so we assume we need to fetch if lat/lng is null
      if (lat !== null && lng !== null) {
        setIsInitializing(false);
        return;
      }

      // Try to forward geocode the address string to restore the pin
      try {
        const response = await fetch(
          `/api/location/search?q=${encodeURIComponent(value)}&limit=1`
        );

        if (!response.ok) {
          throw new Error(`Search proxy failed: ${response.status}`);
        }

        const data = await response.json();
        if (data && data.length > 0) {
          const newLat = parseFloat(data[0].lat);
          const newLng = parseFloat(data[0].lon);
          if (!isNaN(newLat) && !isNaN(newLng)) {
            setLat(newLat);
            setLng(newLng);
          }
        }
      } catch (error) {
        console.error("Failed to restore location from address:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount (or when value changes? No, only if we want to sync external changes, but that causes loops)

  const handleReverseGeocode = useCallback(
    async (newLat: number, newLng: number) => {
      try {
        const response = await fetch(
          `/api/location/reverse?lat=${newLat}&lon=${newLng}`
        );

        if (!response.ok) {
          throw new Error(`Reverse proxy failed: ${response.status}`);
        }

        const data = await response.json();
        if (data && data.display_name) {
          onChange(data.display_name);
        } else {
          const coordString = `${newLat.toFixed(6)}, ${newLng.toFixed(6)}`;
          onChange(coordString);
        }
      } catch (error) {
        console.error("Reverse geocoding failed:", error);
        const coordString = `${newLat.toFixed(6)}, ${newLng.toFixed(6)}`;
        onChange(coordString);
      }
    },
    [onChange]
  );

  const handlePositionChange = useCallback(
    (newLat: number, newLng: number) => {
      setLat(newLat);
      setLng(newLng);
      handleReverseGeocode(newLat, newLng);
    },
    [handleReverseGeocode]
  );

  const handleLocationSelect = useCallback(
    (newLat: number, newLng: number, displayName: string) => {
      setLat(newLat);
      setLng(newLng);
      onChange(displayName);
    },
    [onChange]
  );

  return (
    <div className="space-y-3 w-full">
      <LocationSearchInput
        value={value}
        onChange={onChange}
        onSelectLocation={handleLocationSelect}
        onSave={onSave}
      />
      <div className="relative w-full overflow-hidden rounded-xl border border-input/80 bg-card shadow-inner">
        <div className="relative h-[clamp(280px,45vh,460px)] min-h-[260px] sm:min-h-[300px]">
          <LocationMap
            lat={lat}
            lng={lng}
            onPositionChange={handlePositionChange}
          />
        </div>
      </div>
    </div>
  );
}
