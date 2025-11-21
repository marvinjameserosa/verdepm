import { useState, useEffect, useRef } from "react";

type LatLngTuple = [number, number];

const DEFAULT_MAP_CENTER: LatLngTuple = [14.5995, 120.9842];
const DEFAULT_ANIMATION_SAMPLE_SIZE = 160;

const sampleRoutePoints = (
  points: LatLngTuple[],
  maxPoints = DEFAULT_ANIMATION_SAMPLE_SIZE
) => {
  if (points.length <= maxPoints) {
    return points;
  }

  const sampled: LatLngTuple[] = [];
  const step = Math.ceil(points.length / maxPoints);

  for (let index = 0; index < points.length; index += step) {
    sampled.push(points[index]);
  }

  const lastPoint = points[points.length - 1];
  const lastSampled = sampled[sampled.length - 1];
  if (
    !lastSampled ||
    lastSampled[0] !== lastPoint[0] ||
    lastSampled[1] !== lastPoint[1]
  ) {
    sampled.push(lastPoint);
  }

  return sampled;
};

export function useRouteAnimation() {
  const [routeStartQuery, setRouteStartQuery] = useState("");
  const [routeEndQuery, setRouteEndQuery] = useState("");
  const [routeFuelLiters, setRouteFuelLiters] = useState("");
  const [routeDistanceKm, setRouteDistanceKm] = useState<number | null>(null);
  const [routeDurationMinutes, setRouteDurationMinutes] = useState<
    number | null
  >(null);
  const [startLabel, setStartLabel] = useState<string | null>(null);
  const [endLabel, setEndLabel] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<LatLngTuple>(DEFAULT_MAP_CENTER);
  const [startCoordinate, setStartCoordinate] = useState<LatLngTuple | null>(
    null
  );
  const [endCoordinate, setEndCoordinate] = useState<LatLngTuple | null>(null);
  const [truckPosition, setTruckPosition] = useState<LatLngTuple | null>(null);
  const [routePoints, setRoutePoints] = useState<LatLngTuple[]>([]);
  const [animationPoints, setAnimationPoints] = useState<LatLngTuple[]>([]);
  const [isAnimatingRoute, setIsAnimatingRoute] = useState(false);
  const [isFetchingRoute, setIsFetchingRoute] = useState(false);

  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearAnimationTimer = () => {
    if (animationTimerRef.current) {
      clearInterval(animationTimerRef.current);
      animationTimerRef.current = null;
    }
  };

  useEffect(() => {
    if (startCoordinate) {
      setMapCenter(startCoordinate);
    }
  }, [startCoordinate]);

  useEffect(() => {
    if (!isAnimatingRoute || animationPoints.length === 0) {
      return;
    }

    clearAnimationTimer();
    let stepIndex = 0;
    setTruckPosition(animationPoints[0]);

    animationTimerRef.current = setInterval(() => {
      stepIndex += 1;
      const nextIndex = Math.min(stepIndex, animationPoints.length - 1);
      setTruckPosition(animationPoints[nextIndex]);

      if (nextIndex >= animationPoints.length - 1) {
        clearAnimationTimer();
        setIsAnimatingRoute(false);
      }
    }, 350);

    return () => {
      clearAnimationTimer();
    };
  }, [isAnimatingRoute, animationPoints]);

  useEffect(() => () => clearAnimationTimer(), []);

  const handleAnimateRoute = async (
    setErrorMessage: (msg: string | null) => void
  ) => {
    if (!routeStartQuery.trim() || !routeEndQuery.trim()) {
      setErrorMessage(
        "Enter both origin and destination before calculating the route."
      );
      return;
    }

    clearAnimationTimer();
    setIsAnimatingRoute(false);
    setTruckPosition(null);
    setRoutePoints([]);
    setAnimationPoints([]);
    setRouteDistanceKm(null);
    setRouteDurationMinutes(null);
    setStartCoordinate(null);
    setEndCoordinate(null);
    setStartLabel(null);
    setEndLabel(null);
    setMapCenter(DEFAULT_MAP_CENTER);

    setIsFetchingRoute(true);

    try {
      const response = await fetch("/api/logistics/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startQuery: routeStartQuery.trim(),
          endQuery: routeEndQuery.trim(),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;
        const message =
          payload?.message ??
          "Unable to compute route for the provided locations.";
        throw new Error(message);
      }

      const payload = (await response.json()) as {
        start: { lat: number; lng: number; label: string };
        end: { lat: number; lng: number; label: string };
        distanceKm: number;
        durationMinutes: number;
        polyline: LatLngTuple[];
      };

      if (!payload.polyline || payload.polyline.length === 0) {
        throw new Error("The routing service did not return a valid path.");
      }

      const sampledPoints = sampleRoutePoints(payload.polyline);

      if (sampledPoints.length === 0) {
        throw new Error(
          "The computed route did not contain enough points to animate."
        );
      }

      setStartCoordinate([payload.start.lat, payload.start.lng]);
      setEndCoordinate([payload.end.lat, payload.end.lng]);
      setStartLabel(payload.start.label);
      setEndLabel(payload.end.label);
      setRoutePoints(payload.polyline);
      setAnimationPoints(sampledPoints);
      setTruckPosition(sampledPoints[0] ?? null);
      setRouteDistanceKm(payload.distanceKm);
      setRouteDurationMinutes(payload.durationMinutes);
      setMapCenter([payload.start.lat, payload.start.lng]);
      setIsAnimatingRoute(true);

      if (!routeFuelLiters) {
        const suggestedFuel = payload.distanceKm * 0.35; // approximate diesel usage per km
        setRouteFuelLiters(suggestedFuel.toFixed(1));
      }
    } catch (error) {
      console.error("Failed to animate route", error);
      const message =
        error instanceof Error ? error.message : "Unable to animate route.";
      setErrorMessage(message);
    } finally {
      setIsFetchingRoute(false);
    }
  };

  const mapDisplayCenter =
    truckPosition ?? startCoordinate ?? endCoordinate ?? mapCenter;

  return {
    routeStartQuery,
    setRouteStartQuery,
    routeEndQuery,
    setRouteEndQuery,
    routeFuelLiters,
    setRouteFuelLiters,
    routeDistanceKm,
    routeDurationMinutes,
    startLabel,
    endLabel,
    mapDisplayCenter,
    startCoordinate,
    endCoordinate,
    truckPosition,
    routePoints,
    isFetchingRoute,
    isAnimatingRoute,
    handleAnimateRoute,
  };
}
