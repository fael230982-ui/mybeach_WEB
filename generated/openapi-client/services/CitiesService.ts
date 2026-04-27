/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
import type { CityCreate } from '../models/CityCreate';
import type { CityResponse } from '../models/CityResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CitiesService {
    /**
     * List Cities
     * @returns CityResponse Successful Response
     * @throws ApiError
     */
    public static listCitiesCitiesGet(): CancelablePromise<Array<CityResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/cities/',
        });
    }
    /**
     * Create City
     * @param requestBody
     * @returns CityResponse Successful Response
     * @throws ApiError
     */
    public static createCityCitiesPost(
        requestBody: CityCreate,
    ): CancelablePromise<CityResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/cities/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
