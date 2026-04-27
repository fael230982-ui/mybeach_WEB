/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
import type { AutoUpdateStatus } from '../models/AutoUpdateStatus';
import type { BeachStatusResponse } from '../models/BeachStatusResponse';
import type { ManualObservationUpdate } from '../models/ManualObservationUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class BeachStatusService {
    /**
     * Get Beach Status
     * @param zoneId
     * @returns BeachStatusResponse Successful Response
     * @throws ApiError
     */
    public static getBeachStatusBeachStatusZoneIdGet(
        zoneId: string,
    ): CancelablePromise<BeachStatusResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/beach-status/{zone_id}',
            path: {
                'zone_id': zoneId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Auto Status
     * @param zoneId
     * @param requestBody
     * @returns BeachStatusResponse Successful Response
     * @throws ApiError
     */
    public static updateAutoStatusBeachStatusZoneIdAutoPut(
        zoneId: string,
        requestBody: AutoUpdateStatus,
    ): CancelablePromise<BeachStatusResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/beach-status/{zone_id}/auto',
            path: {
                'zone_id': zoneId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Manual Observations
     * @param zoneId
     * @param requestBody
     * @returns BeachStatusResponse Successful Response
     * @throws ApiError
     */
    public static updateManualObservationsBeachStatusZoneIdObservationsPatch(
        zoneId: string,
        requestBody: ManualObservationUpdate,
    ): CancelablePromise<BeachStatusResponse> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/beach-status/{zone_id}/observations',
            path: {
                'zone_id': zoneId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
