/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
import type { AlertHistoryResponse } from './AlertHistoryResponse';
export type AlertResponse = {
    id: string;
    alert_type: string;
    child_id?: (string | null);
    parent_id: string;
    latitude: number;
    longitude: number;
    city_id: string;
    zone_id?: (string | null);
    status: string;
    created_at?: (string | null);
    history?: Array<AlertHistoryResponse>;
};

