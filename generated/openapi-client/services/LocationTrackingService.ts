/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
import type { LocationUpdate } from '../models/LocationUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class LocationTrackingService {
    /**
     * Ping Location
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static pingLocationLocationsPingPut(
        requestBody: LocationUpdate,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/locations/ping',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
