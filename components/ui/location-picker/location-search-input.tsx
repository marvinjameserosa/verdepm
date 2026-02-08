"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";

type SuggestionItem = {
  label: string;
  query: string;
};

const DEFAULT_SUGGESTIONS: SuggestionItem[] = [
  {
    label: "Makati Central Business District",
    query: "Makati Central Business District, Metro Manila",
  },
  {
    label: "Bonifacio Global City, Taguig",
    query: "Bonifacio Global City, Taguig",
  },
  {
    label: "Quezon City Hall Complex",
    query: "Quezon City Hall Complex, Quezon City",
  },
  {
    label: "Cebu IT Park",
    query: "Cebu IT Park, Cebu City",
  },
  {
    label: "Davao City Hall",
    query: "Davao City Hall, Davao City",
  },
];

type NominatimSearchResult = {
  display_name: string;
  lat: string;
  lon: string;
};

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
  type SearchResult = {
    display_name: string;
    lat?: string;
    lon?: string;
    isSuggestion?: boolean;
    query?: string;
  };
  const [results, setResults] = useState<SearchResult[]>([]);
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
            `/api/location/search?q=${encodeURIComponent(query)}&limit=5`
          );

          if (!response.ok) {
            throw new Error(`Search proxy failed: ${response.status}`);
          }

          const data = (await response.json()) as NominatimSearchResult[];
          const mappedResults: SearchResult[] = data.map((item) => ({
            display_name: item.display_name,
            lat: item.lat,
            lon: item.lon,
          }));
          setResults(mappedResults);
          setShowResults(true);
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setIsSearching(false);
        }
      } else if (!query) {
        setResults(
          DEFAULT_SUGGESTIONS.map((item) => ({
            display_name: item.label,
            query: item.query,
            isSuggestion: true,
          }))
        );
        setShowResults(true);
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

  const handleSelectResult = async (result: SearchResult) => {
    if (result.isSuggestion && result.query) {
      setShowResults(false);
      setIsSearching(true);
      try {
        const response = await fetch(
          `/api/location/search?q=${encodeURIComponent(result.query)}&limit=1`
        );

        if (!response.ok) {
          throw new Error(`Suggestion search failed: ${response.status}`);
        }

        const data = (await response.json()) as NominatimSearchResult[];
        if (data && data[0]) {
          const lat = Number.parseFloat(data[0].lat);
          const lng = Number.parseFloat(data[0].lon);
          setQuery(data[0].display_name);
          onSelectLocation(lat, lng, data[0].display_name);
        } else {
          setQuery(result.query);
          onChange(result.query);
        }
      } catch (error) {
        console.error("Suggestion lookup failed:", error);
        setQuery(result.query);
        onChange(result.query);
      } finally {
        setIsSearching(false);
      }
      return;
    }

    if (!result.lat || !result.lon) {
      setQuery(result.display_name);
      onChange(result.display_name);
      setShowResults(false);
      return;
    }

    const lat = Number.parseFloat(result.lat);
    const lng = Number.parseFloat(result.lon);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      setQuery(result.display_name);
      onChange(result.display_name);
      setShowResults(false);
      return;
    }

    setQuery(result.display_name);
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
      className={cn("relative z-[1100] flex gap-2 w-full", className)}
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
          onFocus={() => {
            if (results.length === 0) {
              setResults(
                DEFAULT_SUGGESTIONS.map((item) => ({
                  display_name: item.label,
                  query: item.query,
                  isSuggestion: true,
                }))
              );
            }
            setShowResults(true);
          }}
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
        <div className="absolute top-full left-0 right-0 mt-1 z-[1200] bg-white dark:bg-gray-900 rounded-md shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden max-h-60 overflow-y-auto">
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
