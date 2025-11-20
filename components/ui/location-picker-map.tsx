"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, MapPin } from "lucide-react";

// Fix for default marker icon in Next.js
const iconUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png";
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png";
const shadowUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type LocationPickerMapProps = {
  value?: string;
  onChange: (value: string) => void;
};

function LocationMarker({
  position,
  setPosition,
  onLocationFound
}: {
  position: L.LatLng | null,
  setPosition: (pos: L.LatLng) => void,
  onLocationFound: (lat: number, lng: number) => void
}) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
      onLocationFound(e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);

  return position === null ? null : (
    <Marker position={position} icon={defaultIcon} />
  );
}

function SearchOverlay({
  onSelect,
  initialQuery,
  onSave
}: {
  onSelect: (lat: number, lng: number, displayName: string) => void,
  initialQuery: string,
  onSave?: () => void
}) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Update query if initialQuery changes (e.g. from reverse geocoding)
  useEffect(() => {
    if (initialQuery && initialQuery !== query) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length > 2 && !isSearching) {
        handleSearch();
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    // Don't hide results immediately when searching automatically
    // setShowResults(false); 
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
      const data = await response.json();
      setResults(data);
      setShowResults(true);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const selectResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    onSelect(lat, lng, result.display_name);
    setShowResults(false);
    setQuery(result.display_name);
    setResults([]);
  };

  return (
    <div className="relative flex items-start gap-2 w-full z-[10]">
      <div className="flex-1 relative flex flex-col gap-1">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="Search location..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pr-10"
            />
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={handleSearch}
              disabled={isSearching}
              type="button"
            >
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {showResults && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 rounded-md shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden max-h-60 overflow-y-auto z-[1000]">
            {results.map((result, i) => (
              <button
                key={i}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-start gap-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
                onClick={() => selectResult(result)}
                type="button"
              >
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <span className="line-clamp-2">{result.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {onSave && (
        <Button
          onClick={onSave}
          className="shadow-md bg-emerald-600 hover:bg-emerald-700 text-white"
          type="button"
        >
          Save
        </Button>
      )}
    </div>
  );
}

export default function LocationPickerMap({ value, onChange, onSave }: LocationPickerMapProps & { onSave?: () => void }) {
  // We need to track if the value is coordinates or an address
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [addressName, setAddressName] = useState("");

  // Initialize from value
  useEffect(() => {
    if (!value) return;

    // Check if value is coordinates "lat, lng"
    const parts = value.split(",").map(s => parseFloat(s.trim()));
    const isCoordinates = parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]);

    if (isCoordinates) {
      const newPos = L.latLng(parts[0], parts[1]);
      // Only update if significantly different to avoid loops
      if (!position || position.distanceTo(newPos) > 10) {
        setPosition(newPos);
      }
    } else {
      // Value is an address string
      setAddressName(value);
    }
  }, [value]);

  const handleReverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      if (data && data.display_name) {
        setAddressName(data.display_name);
        onChange(data.display_name);
      } else {
        // Fallback to coords if no address found
        const coordString = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        setAddressName(coordString);
        onChange(coordString);
      }
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      const coordString = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      onChange(coordString);
    }
  }, [onChange]);

  const handleSearchResult = useCallback((lat: number, lng: number, displayName: string) => {
    const newPos = L.latLng(lat, lng);
    setPosition(newPos);
    setAddressName(displayName);
    onChange(displayName);
  }, [onChange]);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    // When map is clicked, we update position and reverse geocode
    // We do NOT call onChange here immediately with coords, we wait for reverse geocode
    handleReverseGeocode(lat, lng);
  }, [handleReverseGeocode]);

  // Default to Manila if no position
  const center = position || { lat: 14.5995, lng: 120.9842 };

  return (
    <div className="flex flex-col gap-3 w-full">
      <SearchOverlay onSelect={handleSearchResult} initialQuery={addressName} onSave={onSave} />
      <div className="h-[300px] w-full rounded-md overflow-hidden border border-input z-0 relative">
        <MapContainer center={center} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker
            position={position}
            setPosition={setPosition}
            onLocationFound={handleMapClick}
          />
        </MapContainer>
      </div>
    </div>
  );
}
