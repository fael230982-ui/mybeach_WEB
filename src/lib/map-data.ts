import { isActiveAlert, isPendingAlert, isResolvedAlert } from "./alerts.ts";
import { getMapPoint } from "./geo.ts";
import type { AppAlert, AppBeach, AppCity, AppPost, AppZone, LatLngTuple } from "./types.ts";

export type MapFilterValue = string;

export type MapStats = {
  total: number;
  pending: number;
  active: number;
  solved: number;
};

const DEFAULT_MAP_CENTER: LatLngTuple = [-23.9712, -46.3705];

export function filterMapAlerts(alerts: AppAlert[], cityId: MapFilterValue, beachId: MapFilterValue) {
  return alerts.filter((alert) => {
    const matchesCity = cityId === "all" || alert.city_id === cityId;
    const matchesBeach = beachId === "all" || alert.beach_id === beachId;
    return matchesCity && matchesBeach;
  });
}

export function getBeachesByCity(beaches: AppBeach[], cityId: MapFilterValue) {
  if (cityId === "all") {
    return beaches;
  }

  return beaches.filter((beach) => beach.city_id === cityId);
}

export function filterMapPosts(
  posts: AppPost[],
  beaches: AppBeach[],
  cityId: MapFilterValue,
  beachId: MapFilterValue,
) {
  return posts.filter((post) => {
    if (beachId !== "all") {
      return post.beach_id === beachId;
    }

    if (cityId === "all") {
      return true;
    }

    const beach = beaches.find((item) => item.id === post.beach_id);
    return beach?.city_id === cityId;
  });
}

export function filterMapZones(zones: AppZone[], cityId: MapFilterValue, beachId: MapFilterValue) {
  return zones.filter((zone) => {
    const matchesCity = cityId === "all" || zone.city_id === cityId;
    const matchesBeach = beachId === "all" || zone.beach_id === beachId;
    return matchesCity && matchesBeach;
  });
}

export function getFocusedAlert(alerts: AppAlert[], focusId: string | null) {
  return alerts.find((alert) => alert.id === focusId) ?? alerts[0] ?? null;
}

export function getMapCenter(options: {
  focusedAlert: AppAlert | null;
  beaches: AppBeach[];
  cities: AppCity[];
  selectedBeachId: MapFilterValue;
  selectedCityId: MapFilterValue;
}) {
  if (options.focusedAlert) {
    return [options.focusedAlert.latitude, options.focusedAlert.longitude] as LatLngTuple;
  }

  const beach = options.beaches.find((item) => item.id === options.selectedBeachId);
  const city = options.cities.find((item) => item.id === options.selectedCityId);

  return (beach && getMapPoint(beach)) || (city && getMapPoint(city)) || DEFAULT_MAP_CENTER;
}

export function buildMapStats(alerts: AppAlert[]): MapStats {
  return {
    total: alerts.length,
    pending: alerts.filter((alert) => isPendingAlert(alert.status)).length,
    active: alerts.filter((alert) => isActiveAlert(alert.status) && !isPendingAlert(alert.status)).length,
    solved: alerts.filter((alert) => isResolvedAlert(alert.status)).length,
  };
}
