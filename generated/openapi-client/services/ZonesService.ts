/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
import type { ZoneCreate } from '../models/ZoneCreate';
import type { ZoneResponse } from '../models/ZoneResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ZonesService {
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
}
