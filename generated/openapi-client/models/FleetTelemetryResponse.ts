/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FleetStatus } from './FleetStatus';
export type FleetTelemetryResponse = {
    fleet_id: string;
    identifier: string;
    status: FleetStatus;
    is_operational: boolean;
    latitude?: (number | null);
    longitude?: (number | null);
    last_ping?: (string | null);
    updated_at?: (string | null);
    assigned_post_id?: (string | null);
    current_crew?: (string | null);
    base_sector?: (string | null);
};

