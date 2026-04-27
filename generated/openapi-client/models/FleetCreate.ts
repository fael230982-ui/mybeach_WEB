/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FleetStatus } from './FleetStatus';
export type FleetCreate = {
    type: string;
    identifier: string;
    status?: FleetStatus;
    current_crew?: (string | null);
    base_sector?: (string | null);
};

