"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";

type LocationSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSelectLocation: (lat: number, lng: number, displayName: string) => void;
  onSave?: () => void;
  className?: string;
};

export function LocationSearchInput({
  value,
  onChange,
  onSelectLocation,
  onSave,
  className,
}: LocationSearchInputProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query && query.length > 2 && query !== value) {
        setIsSearching(true);
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              query
            )}&limit=5`
          );
          const data = await response.json();
          setResults(data);
          setShowResults(true);
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 800); // 800ms delay

    return () => clearTimeout(timer);
  }, [query, value]);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    onSelectLocation(lat, lng, result.display_name);
    setShowResults(false);
  };

  const clearSearch = () => {
    setQuery("");
    onChange("");
    setShowResults(false);
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative flex gap-2 w-full", className)}
    >
      <div className="relative flex-1">
        <Input
          placeholder="Search for a location..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            // We don't call onChange here directly to avoid loops
            // onChange is called when a location is selected or cleared
          }}
          onFocus={() => query && results.length > 0 && setShowResults(true)}
          className="pr-10"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isSearching && <Loader2 className="h-4 w-4 animate-spin" />}
          {query && !isSearching && (
            <button
              onClick={clearSearch}
              className="text-gray-400 hover:text-gray-600"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {onSave && (
        <Button
          onClick={onSave}
          className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[80px]"
          type="button"
        >
          Save
        </Button>
      )}

      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white dark:bg-gray-900 rounded-md shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden max-h-60 overflow-y-auto">
          {results.map((result, i) => (
            <button
              key={i}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-start gap-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
              onClick={() => handleSelectResult(result)}
              type="button"
            >
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <span className="line-clamp-2">{result.display_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
