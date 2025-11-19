"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

type LocationMapProps = {
  lat: number | null;
  lng: number | null;
  onPositionChange: (lat: number, lng: number) => void;
};

function LocationMarker({
  lat,
  lng,
  onPositionChange,
}: {
  lat: number | null;
  lng: number | null;
  onPositionChange: (lat: number, lng: number) => void;
}) {
  const position = useMemo(() => (lat !== null && lng !== null ? L.latLng(lat, lng) : null), [lat, lng]);

  const map = useMapEvents({
    click(e) {
      onPositionChange(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom());
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

export default function LocationMap({ lat, lng, onPositionChange }: LocationMapProps) {
  // Default to Manila if no position
  const center = (lat !== null && lng !== null) ? { lat, lng } : { lat: 14.5995, lng: 120.9842 };

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker lat={lat} lng={lng} onPositionChange={onPositionChange} />
    </MapContainer>
  );
}
