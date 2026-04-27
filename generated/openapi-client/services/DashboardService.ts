/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DashboardService {
    /**
     * Get Dashboard Summary
     * @param cityId Filtro opcional do dropdown de cidades
     * @param beachId Filtro opcional do dropdown de praias
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getDashboardSummaryDashboardStatsGet(
        cityId?: (string | null),
        beachId?: (string | null),
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/dashboard/stats/',
            query: {
                'city_id': cityId,
                'beach_id': beachId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Dashboard Summary
     * @param cityId Filtro opcional do dropdown de cidades
     * @param beachId Filtro opcional do dropdown de praias
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getDashboardSummaryDashboardStatsGet1(
        cityId?: (string | null),
        beachId?: (string | null),
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/dashboard/stats',
            query: {
                'city_id': cityId,
                'beach_id': beachId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
