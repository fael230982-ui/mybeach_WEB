/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CityCreate } from '../models/CityCreate';
import type { CityResponse } from '../models/CityResponse';
import type { CityUpdate } from '../models/CityUpdate';
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
    /**
     * List Cities
     * @returns CityResponse Successful Response
     * @throws ApiError
     */
    public static listCitiesCitiesGet1(): CancelablePromise<Array<CityResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/cities',
        });
    }
    /**
     * Create City
     * @param requestBody
     * @returns CityResponse Successful Response
     * @throws ApiError
     */
    public static createCityCitiesPost1(
        requestBody: CityCreate,
    ): CancelablePromise<CityResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/cities',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get City
     * @param cityId
     * @returns CityResponse Successful Response
     * @throws ApiError
     */
    public static getCityCitiesCityIdGet(
        cityId: string,
    ): CancelablePromise<CityResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/cities/{city_id}',
            path: {
                'city_id': cityId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update City
     * @param cityId
     * @param requestBody
     * @returns CityResponse Successful Response
     * @throws ApiError
     */
    public static updateCityCitiesCityIdPatch(
        cityId: string,
        requestBody: CityUpdate,
    ): CancelablePromise<CityResponse> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/cities/{city_id}',
            path: {
                'city_id': cityId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete City
     * @param cityId
     * @returns void
     * @throws ApiError
     */
    public static deleteCityCitiesCityIdDelete(
        cityId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/cities/{city_id}',
            path: {
                'city_id': cityId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
