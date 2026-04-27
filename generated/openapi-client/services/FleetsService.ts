/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FleetCreate } from '../models/FleetCreate';
import type { FleetResponse } from '../models/FleetResponse';
import type { FleetTelemetryResponse } from '../models/FleetTelemetryResponse';
import type { FleetUpdate } from '../models/FleetUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class FleetsService {
    /**
     * List Fleets
     * @returns FleetResponse Successful Response
     * @throws ApiError
     */
    public static listFleetsFleetsGet(): CancelablePromise<Array<FleetResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/fleets/',
        });
    }
    /**
     * Create Fleet
     * @param requestBody
     * @returns FleetResponse Successful Response
     * @throws ApiError
     */
    public static createFleetFleetsPost(
        requestBody: FleetCreate,
    ): CancelablePromise<FleetResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/fleets/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Fleets
     * @returns FleetResponse Successful Response
     * @throws ApiError
     */
    public static listFleetsFleetsGet1(): CancelablePromise<Array<FleetResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/fleets',
        });
    }
    /**
     * Create Fleet
     * @param requestBody
     * @returns FleetResponse Successful Response
     * @throws ApiError
     */
    public static createFleetFleetsPost1(
        requestBody: FleetCreate,
    ): CancelablePromise<FleetResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/fleets',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Fleet
     * @param fleetId
     * @returns FleetResponse Successful Response
     * @throws ApiError
     */
    public static getFleetFleetsFleetIdGet(
        fleetId: string,
    ): CancelablePromise<FleetResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/fleets/{fleet_id}',
            path: {
                'fleet_id': fleetId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Fleet
     * @param fleetId
     * @param requestBody
     * @returns FleetResponse Successful Response
     * @throws ApiError
     */
    public static updateFleetFleetsFleetIdPatch(
        fleetId: string,
        requestBody: FleetUpdate,
    ): CancelablePromise<FleetResponse> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/fleets/{fleet_id}',
            path: {
                'fleet_id': fleetId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Fleet
     * @param fleetId
     * @returns void
     * @throws ApiError
     */
    public static deleteFleetFleetsFleetIdDelete(
        fleetId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/fleets/{fleet_id}',
            path: {
                'fleet_id': fleetId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Fleet Telemetry
     * @param fleetId
     * @returns FleetTelemetryResponse Successful Response
     * @throws ApiError
     */
    public static getFleetTelemetryFleetsFleetIdTelemetryGet(
        fleetId: string,
    ): CancelablePromise<FleetTelemetryResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/fleets/{fleet_id}/telemetry',
            path: {
                'fleet_id': fleetId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
