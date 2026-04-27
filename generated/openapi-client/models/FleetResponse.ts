/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FleetStatus } from './FleetStatus';
export type FleetResponse = {
    id: string;
    type: string;
    identifier: string;
    status: FleetStatus;
    current_crew?: (string | null);
    base_sector?: (string | null);
    last_ping?: (string | null);
    updated_at?: (string | null);
    latitude?: (number | null);
    longitude?: (number | null);
    assigned_post_id?: (string | null);
    is_operational?: boolean;
};

