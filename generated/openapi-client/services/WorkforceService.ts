/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class WorkforceService {
    /**
     * List Operational Workforce
     * @returns any Successful Response
     * @throws ApiError
     */
    public static listOperationalWorkforceWorkforceGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/workforce',
        });
    }
    /**
     * Get Workforce Summary
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getWorkforceSummaryWorkforceSummaryGet(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/workforce/summary',
        });
    }
    /**
     * Get Workforce Shifts
     * @param referenceHour
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getWorkforceShiftsWorkforceShiftsGet(
        referenceHour?: (number | null),
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/workforce/shifts',
            query: {
                'reference_hour': referenceHour,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
