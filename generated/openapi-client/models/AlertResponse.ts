/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AlertHistoryResponse } from './AlertHistoryResponse';
import type { CreatorInfo } from './CreatorInfo';
export type AlertResponse = {
    id: string;
    alert_type: string;
    status: string;
    latitude: number;
    longitude: number;
    battery_level?: (number | null);
    created_by?: (CreatorInfo | null);
    child_id?: (string | null);
    parent_id?: (string | null);
    city_id?: (string | null);
    beach_id?: (string | null);
    zone_id?: (string | null);
    beach_name?: (string | null);
    zone_name?: (string | null);
    created_at?: (string | null);
    accepted_at?: (string | null);
    resolved_at?: (string | null);
    resolved_by_id?: (string | null);
    procedimento?: (string | null);
    apoio_acionado?: (string | null);
    desfecho?: (string | null);
    observacoes_finais?: (string | null);
    history?: Array<AlertHistoryResponse>;
};

