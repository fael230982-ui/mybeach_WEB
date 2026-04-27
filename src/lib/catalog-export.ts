import { toDisplayStatus } from "./formatters.ts";
import type { AppBeach, AppCity, AppPost, AppUser, AppZone } from "./types.ts";

type CityCatalogRow = AppCity & { qtdPraias: number; qtdPostos: number };

export function exportableCityRows(cities: CityCatalogRow[]) {
  return cities.map((city) => [
    city.name,
    city.state || city.uf || "",
    toDisplayStatus(city.status || "ATIVO"),
    city.qtdPraias,
    city.qtdPostos,
  ]);
}

export function exportableBeachRows(beaches: AppBeach[], cities: AppCity[]) {
  return beaches.map((beach) => {
    const city = cities.find((item) => String(item.id) === String(beach.city_id));

    return [
      beach.name,
      city?.name || "Cidade vinculada",
      city?.state || city?.uf || "",
      toDisplayStatus(beach.status || "ATIVO"),
      beach.area || "",
    ];
  });
}

export function exportablePostRows(posts: AppPost[], beaches: AppBeach[]) {
  return posts.map((post) => {
    const beach = beaches.find((item) => String(item.id) === String(post.beach_id));

    return [
      post.name,
      beach?.name || "Praia desconhecida",
      toDisplayStatus(post.status || "ATIVO"),
      post.latitude ?? "",
      post.longitude ?? "",
      post.radius ?? "",
    ];
  });
}

export function exportableUserRows(users: AppUser[]) {
  return users.map((user) => [
    user.name,
    user.email,
    user.role,
    user.city_name || "",
    user.email_verified === true ? "SIM" : user.email_verified === false ? "NÃO" : "",
    user.last_ping || "",
    user.is_active === true ? "SIM" : user.is_active === false ? "NÃO" : "",
  ]);
}

export function exportableZoneRows(zones: AppZone[], beaches: AppBeach[]) {
  return zones.map((zone) => {
    const beach = beaches.find((item) => String(item.id) === String(zone.beach_id));

    return [
      zone.name,
      beach?.name || "",
      zone.status_level || "",
      Array.isArray(zone.coordinates) ? zone.coordinates.length : zone.coordinates || "",
    ];
  });
}
