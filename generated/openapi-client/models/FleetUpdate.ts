/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FleetStatus } from './FleetStatus';
export type FleetUpdate = {
    type?: (string | null);
    identifier?: (string | null);
    status?: (FleetStatus | null);
    current_crew?: (string | null);
    base_sector?: (string | null);
    last_ping?: (string | null);
    latitude?: (number | null);
    longitude?: (number | null);
    assigned_post_id?: (string | null);
};

