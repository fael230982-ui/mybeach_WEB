/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BeachCreate } from '../models/BeachCreate';
import type { BeachResponse } from '../models/BeachResponse';
import type { BeachUpdate } from '../models/BeachUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class BeachesService {
    /**
     * List Beaches
     * @returns BeachResponse Successful Response
     * @throws ApiError
     */
    public static listBeachesBeachesGet(): CancelablePromise<Array<BeachResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/beaches/',
        });
    }
    /**
     * Create Beach
     * @param requestBody
     * @returns BeachResponse Successful Response
     * @throws ApiError
     */
    public static createBeachBeachesPost(
        requestBody: BeachCreate,
    ): CancelablePromise<BeachResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/beaches/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Beaches
     * @returns BeachResponse Successful Response
     * @throws ApiError
     */
    public static listBeachesBeachesGet1(): CancelablePromise<Array<BeachResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/beaches',
        });
    }
    /**
     * Create Beach
     * @param requestBody
     * @returns BeachResponse Successful Response
     * @throws ApiError
     */
    public static createBeachBeachesPost1(
        requestBody: BeachCreate,
    ): CancelablePromise<BeachResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/beaches',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Beach
     * @param beachId
     * @returns BeachResponse Successful Response
     * @throws ApiError
     */
    public static getBeachBeachesBeachIdGet(
        beachId: string,
    ): CancelablePromise<BeachResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/beaches/{beach_id}',
            path: {
                'beach_id': beachId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Beach
     * @param beachId
     * @param requestBody
     * @returns BeachResponse Successful Response
     * @throws ApiError
     */
    public static updateBeachBeachesBeachIdPatch(
        beachId: string,
        requestBody: BeachUpdate,
    ): CancelablePromise<BeachResponse> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/beaches/{beach_id}',
            path: {
                'beach_id': beachId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Beach
     * @param beachId
     * @param requestBody
     * @returns BeachResponse Successful Response
     * @throws ApiError
     */
    public static updateBeachBeachesBeachIdPut(
        beachId: string,
        requestBody: BeachUpdate,
    ): CancelablePromise<BeachResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/beaches/{beach_id}',
            path: {
                'beach_id': beachId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Beach
     * @param beachId
     * @returns void
     * @throws ApiError
     */
    public static deleteBeachBeachesBeachIdDelete(
        beachId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/beaches/{beach_id}',
            path: {
                'beach_id': beachId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
