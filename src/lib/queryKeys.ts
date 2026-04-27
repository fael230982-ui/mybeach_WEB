export const queryKeys = {
  alerts: ["alerts"] as const,
  beaches: ["beaches"] as const,
  cities: ["cities"] as const,
  dashboard: ["dashboard"] as const,
  fleets: ["fleets"] as const,
  logs: ["logs"] as const,
  mapData: ["map-data"] as const,
  posts: ["posts"] as const,
  reports: ["reports"] as const,
  users: ["users"] as const,
  zones: ["zones"] as const,
  user: (id: string) => ["users", id] as const,
};
