export type ApiErrorLike = Error & {
  status?: number;
  body?: unknown;
};

export type UserRole = "MASTER" | "ADMIN" | "GV" | "GUARDA" | "CENTRAL" | string;

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  city_id?: string | null;
  city_name?: string | null;
  email_verified?: boolean;
  fcm_token?: string | null;
  last_ping?: string | null;
  is_active?: boolean | null;
}

export interface AppCity {
  id: string;
  name: string;
  state: string;
  status?: string;
  uf?: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  lat?: number | string | null;
  lng?: number | string | null;
}

export interface AppBeach {
  id: string;
  city_id: string;
  name: string;
  status?: string;
  area?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  lat?: number | string | null;
  lng?: number | string | null;
}

export interface AppZone {
  id: string;
  city_id?: string;
  beach_id?: string;
  name: string;
  status_level?: "BAIXO" | "MEDIO" | "ALTO" | string;
  coordinates?: string | number[][];
}

export interface AppPost {
  id: string;
  beach_id: string;
  name: string;
  status?: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  radius?: number | string | null;
}

export interface AppAlert {
  id: string;
  alert_type: string;
  latitude: number;
  longitude: number;
  city_id?: string;
  beach_id?: string | null;
  zone_id?: string | null;
  status: string;
  created_at?: string | null;
  updated_at?: string | null;
  accepted_at?: string | null;
  resolved_at?: string | null;
  beach_name?: string | null;
  location_name?: string | null;
  user_name?: string | null;
  battery_level?: number | null;
  procedimento?: string | null;
  observacoes_finais?: string | null;
}

export interface FleetUnit {
  id: string;
  identifier?: string;
  prefixo?: string;
  type?: string;
  tipo?: string;
  status?: string;
  equipe?: string;
  base?: string;
  last_ping?: string;
}

export interface AuditLogEntry {
  id?: string;
  created_at?: string;
  action?: string;
  endpoint?: string;
  user?: string;
  user_id?: string;
  ip?: string;
  status?: string | number;
}

export type LatLngTuple = [number, number];
