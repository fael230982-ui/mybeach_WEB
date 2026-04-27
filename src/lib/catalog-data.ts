import { FILTER_ALL_FEMININE } from "./filters.ts";
import { normalizeText } from "./formatters.ts";
import type { AppBeach, AppCity, AppPost } from "./types.ts";

export type SortDirection = "AZ" | "ZA";

export function normalizeBeachStatus(beaches: AppBeach[]) {
  return beaches.map((beach) => ({
    ...beach,
    status: beach.status ? beach.status.toUpperCase() : "ATIVO",
  }));
}

export function normalizePostStatus(posts: AppPost[]) {
  return posts.map((post) => ({
    ...post,
    status: post.status ? post.status.toUpperCase() : "ATIVO",
  }));
}

export function filterBeachCatalog(options: {
  beaches: AppBeach[];
  cities: AppCity[];
  cityFilter: string;
  search: string;
  sort: SortDirection;
}) {
  let filtered = [...options.beaches];

  if (options.cityFilter !== FILTER_ALL_FEMININE) {
    filtered = filtered.filter((beach) => String(beach.city_id) === String(options.cityFilter));
  }

  if (options.search) {
    const query = normalizeText(options.search);
    filtered = filtered.filter((beach) => {
      const city = options.cities.find((item) => String(item.id) === String(beach.city_id));
      const cityName = normalizeText(city?.name || "");
      const cityUf = normalizeText(city?.state || city?.uf || "");

      return (
        normalizeText(beach.name).includes(query) ||
        normalizeText(beach.area || "").includes(query) ||
        cityName.includes(query) ||
        cityUf.includes(query)
      );
    });
  }

  filtered.sort((left, right) =>
    options.sort === "AZ" ? left.name.localeCompare(right.name) : right.name.localeCompare(left.name),
  );

  return filtered;
}

export function filterPostCatalog(options: {
  posts: AppPost[];
  beaches: AppBeach[];
  cityFilter?: string | null;
  beachFilter: string;
  search: string;
}) {
  let filtered = [...options.posts];

  if (options.cityFilter) {
    const beachIds = options.beaches
      .filter((beach) => String(beach.city_id) === String(options.cityFilter))
      .map((beach) => String(beach.id));
    filtered = filtered.filter((post) => beachIds.includes(String(post.beach_id)));
  }

  if (options.beachFilter !== FILTER_ALL_FEMININE) {
    filtered = filtered.filter((post) => String(post.beach_id) === String(options.beachFilter));
  }

  if (options.search) {
    const query = normalizeText(options.search);
    filtered = filtered.filter((post) => {
      const beach = options.beaches.find((item) => String(item.id) === String(post.beach_id));
      return (
        normalizeText(post.name || "").includes(query) ||
        normalizeText(beach?.name || "").includes(query)
      );
    });
  }

  filtered.sort((left, right) => left.name.localeCompare(right.name));
  return filtered;
}
