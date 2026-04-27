/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { WorkforceListResponse } from '../models/WorkforceListResponse';
import type { WorkforceShiftsResponse } from '../models/WorkforceShiftsResponse';
import type { WorkforceSummaryResponse } from '../models/WorkforceSummaryResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class WorkforceService {
    /**
     * List Operational Workforce
     * @returns WorkforceListResponse Successful Response
     * @throws ApiError
     */
    public static listOperationalWorkforceWorkforceGet(): CancelablePromise<WorkforceListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/workforce',
        });
    }
    /**
     * Get Workforce Summary
     * @returns WorkforceSummaryResponse Successful Response
     * @throws ApiError
     */
    public static getWorkforceSummaryWorkforceSummaryGet(): CancelablePromise<WorkforceSummaryResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/workforce/summary',
        });
    }
    /**
     * Get Workforce Shifts
     * @param referenceHour
     * @returns WorkforceShiftsResponse Successful Response
     * @throws ApiError
     */
    public static getWorkforceShiftsWorkforceShiftsGet(
        referenceHour?: (number | null),
    ): CancelablePromise<WorkforceShiftsResponse> {
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
