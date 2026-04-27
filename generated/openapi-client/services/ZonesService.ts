/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ZoneCreate } from '../models/ZoneCreate';
import type { ZoneResponse } from '../models/ZoneResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ZonesService {
    /**
     * List Zones
     * @returns ZoneResponse Successful Response
     * @throws ApiError
     */
    public static listZonesZonesGet(): CancelablePromise<Array<ZoneResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/zones/',
        });
    }
    /**
     * Create Zone
     * @param requestBody
     * @returns ZoneResponse Successful Response
     * @throws ApiError
     */
    public static createZoneZonesPost(
        requestBody: ZoneCreate,
    ): CancelablePromise<ZoneResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/zones/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Zones
     * @returns ZoneResponse Successful Response
     * @throws ApiError
     */
    public static listZonesZonesGet1(): CancelablePromise<Array<ZoneResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/zones',
        });
    }
    /**
     * Create Zone
     * @param requestBody
     * @returns ZoneResponse Successful Response
     * @throws ApiError
     */
    public static createZoneZonesPost1(
        requestBody: ZoneCreate,
    ): CancelablePromise<ZoneResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/zones',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Zone
     * @param zoneId
     * @returns ZoneResponse Successful Response
     * @throws ApiError
     */
    public static getZoneZonesZoneIdGet(
        zoneId: string,
    ): CancelablePromise<ZoneResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/zones/{zone_id}',
            path: {
                'zone_id': zoneId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Zone
     * @param zoneId
     * @returns void
     * @throws ApiError
     */
    public static deleteZoneZonesZoneIdDelete(
        zoneId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/zones/{zone_id}',
            path: {
                'zone_id': zoneId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
