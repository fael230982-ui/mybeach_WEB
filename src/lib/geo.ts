import type { AppBeach, AppZone, LatLngTuple } from "./types.ts";

type MappablePoint = {
  latitude?: number | string | null;
  longitude?: number | string | null;
  lat?: number | string | null;
  lng?: number | string | null;
};

export function parseCoordinate(value: unknown) {
  const numericValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseFloat(value)
        : Number.NaN;

  return Number.isFinite(numericValue) ? numericValue : null;
}

export function getBeachCenter(beach: AppBeach): LatLngTuple | null {
  const latitude = parseCoordinate(beach.latitude ?? beach.lat);
  const longitude = parseCoordinate(beach.longitude ?? beach.lng);

  if (latitude !== null && longitude !== null) {
    return [latitude, longitude];
  }

  if (beach.area?.includes("POLYGON")) {
    const match = beach.area.match(/POLYGON\(\(\s*([-0-9.]+)\s+([-0-9.]+)/);
    if (match) {
      const lng = parseCoordinate(match[1]);
      const lat = parseCoordinate(match[2]);
      if (lat !== null && lng !== null) {
        return [lat, lng];
      }
    }
  }

  return null;
}

export function getMapPoint(item: MappablePoint): LatLngTuple | null {
  const latitude = parseCoordinate(item.latitude ?? item.lat);
  const longitude = parseCoordinate(item.longitude ?? item.lng);

  return latitude !== null && longitude !== null ? [latitude, longitude] : null;
}

export function parseZoneCoordinates(zone: AppZone) {
  try {
    const parsed =
      typeof zone.coordinates === "string"
        ? (JSON.parse(zone.coordinates) as number[][])
        : ((zone.coordinates || []) as number[][]);

    return parsed
      .map((point) => {
        const first = parseCoordinate(point[0]);
        const second = parseCoordinate(point[1]);

        if (first === null || second === null) {
          return null;
        }

        return [second, first] as LatLngTuple;
      })
      .filter((point): point is LatLngTuple => point !== null);
  } catch {
    return [] as LatLngTuple[];
  }
}
