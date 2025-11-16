"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

type LatLngTuple = [number, number];

export type DeliveryRouteMapProps = {
  center: LatLngExpression;
  start?: LatLngTuple | null;
  end?: LatLngTuple | null;
  startLabel?: string | null;
  endLabel?: string | null;
  truckPosition?: LatLngTuple | null;
  polyline: LatLngTuple[];
};

const createWaypointIcon = (background: string, label: string) =>
  L.divIcon({
    className: "",
    html: `<div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:${background};color:#fff;font-weight:600;border:2px solid #fff;box-shadow:0 4px 8px rgba(15,23,42,0.25);">${label}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

const MapViewController = ({
  center,
  polyline,
}: {
  center: LatLngExpression;
  polyline: LatLngTuple[];
}) => {
  const map = useMap();

  useEffect(() => {
    if (!map) {
      return;
    }

    if (polyline.length > 1) {
      const bounds = L.latLngBounds(polyline);
      map.fitBounds(bounds, { padding: [32, 32] });
    } else {
      map.setView(center, Math.max(map.getZoom(), 13));
    }

    map.invalidateSize();
  }, [map, center, polyline]);

  return null;
};

export default function DeliveryRouteMap({
  center,
  start,
  end,
  startLabel,
  endLabel,
  truckPosition,
  polyline,
}: DeliveryRouteMapProps) {
  const truckIcon = useMemo(
    () =>
      L.icon({
        iconUrl: "/icons/truck-marker.svg",
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -12],
        className: "drop-shadow-md",
      }),
    []
  );

  const startIcon = useMemo(() => createWaypointIcon("#0f766e", "A"), []);
  const endIcon = useMemo(() => createWaypointIcon("#f97316", "B"), []);

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom
      className="h-80 w-full"
      style={{ borderRadius: "0.75rem" }}
    >
      <MapViewController center={center} polyline={polyline} />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {polyline.length > 0 ? (
        <Polyline positions={polyline} color="#0f766e" weight={5} opacity={0.85} />
      ) : null}
      {start ? (
        <Marker position={start} icon={startIcon} riseOnHover>
          {startLabel ? <Popup>{startLabel}</Popup> : null}
        </Marker>
      ) : null}
      {end ? (
        <Marker position={end} icon={endIcon} riseOnHover>
          {endLabel ? <Popup>{endLabel}</Popup> : null}
        </Marker>
      ) : null}
      {truckPosition ? (
        <Marker position={truckPosition} icon={truckIcon} zIndexOffset={1000} />
      ) : null}
    </MapContainer>
  );
}
