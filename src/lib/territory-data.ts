import { getBeachCenter } from "./geo.ts";
import { normalizeText } from "./formatters.ts";
import type { AppBeach, AppCity, LatLngTuple } from "./types.ts";

const CITY_PRESET_CENTERS: Record<string, LatLngTuple> = {
  Santos: [-23.9608, -46.3336],
  Guaruja: [-23.9934, -46.2564],
  "Sao Vicente": [-23.9631, -46.3919],
  "Praia Grande": [-24.0058, -46.4137],
  Bertioga: [-23.8499, -46.1387],
  Cubatao: [-23.895, -46.4252],
  Mongagua: [-23.7915, -45.6186],
  Itanhaem: [-24.1804, -46.7865],
  Peruibe: [-24.3188, -46.9961],
};

const BEACH_PRESET_CENTERS: Record<string, LatLngTuple> = {
  pitangueiras: [-23.9984, -46.2575],
  enseada: [-23.9822, -46.2274],
  tombo: [-24.0152, -46.2691],
  asturias: [-23.9995, -46.2323],
  pernambuco: [-23.9614, -46.1824],
  guaiuba: [-24.0044, -46.2764],
  pereque: [-23.9381, -46.1819],
  tortugas: [-23.9747, -46.2081],
  "mar casada": [-23.9614, -46.1824],
  branca: [-23.9069, -46.1368],
  preta: [-23.9142, -46.1264],
  camburi: [-23.8827, -46.1311],
  iporanga: [-23.9312, -46.1245],
};

export function getCityPresetCenter(cityName?: string | null) {
  if (!cityName) {
    return null;
  }

  return CITY_PRESET_CENTERS[cityName] || null;
}

export function getCityMapCenter(city?: AppCity | null) {
  if (!city) {
    return null;
  }

  return (
    getCityPresetCenter(city.name) ||
    getBeachCenter({
      id: "",
      city_id: city.id,
      name: city.name,
      latitude: city.latitude,
      longitude: city.longitude,
      lat: city.lat,
      lng: city.lng,
    })
  );
}

export function getBeachPresetCenter(beach?: AppBeach | null) {
  if (!beach) {
    return null;
  }

  const normalizedName = normalizeText(beach.name);
  const key = Object.keys(BEACH_PRESET_CENTERS).find((candidate) => normalizedName.includes(candidate));
  return key ? BEACH_PRESET_CENTERS[key] : null;
}

export function getOperationalBeachCenter(beach?: AppBeach | null) {
  if (!beach) {
    return null;
  }

  return getBeachCenter(beach) || getBeachPresetCenter(beach);
}

export function filterBeachesByCity(beaches: AppBeach[], cityId?: string | null) {
  if (!cityId) {
    return beaches;
  }

  return beaches.filter((beach) => String(beach.city_id) === String(cityId));
}
