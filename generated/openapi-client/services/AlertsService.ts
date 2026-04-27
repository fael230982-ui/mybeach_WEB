/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AlertCreate } from '../models/AlertCreate';
import type { AlertResponse } from '../models/AlertResponse';
import type { AlertUpdateStatus } from '../models/AlertUpdateStatus';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AlertsService {
    /**
     * List Alerts
     * Lista todos os alertas com nomes de praia e zona
     * @param limit
     * @param offset
     * @returns AlertResponse Successful Response
     * @throws ApiError
     */
    public static listAlertsAlertsGet(
        limit: number = 100,
        offset?: number,
    ): CancelablePromise<Array<AlertResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/alerts/',
            query: {
                'limit': limit,
                'offset': offset,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Alert
     * @param requestBody
     * @returns AlertResponse Successful Response
     * @throws ApiError
     */
    public static createAlertAlertsPost(
        requestBody: AlertCreate,
    ): CancelablePromise<AlertResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/alerts/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Alerts
     * Lista todos os alertas com nomes de praia e zona
     * @param limit
     * @param offset
     * @returns AlertResponse Successful Response
     * @throws ApiError
     */
    public static listAlertsAlertsGet1(
        limit: number = 100,
        offset?: number,
    ): CancelablePromise<Array<AlertResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/alerts',
            query: {
                'limit': limit,
                'offset': offset,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Alert
     * @param requestBody
     * @returns AlertResponse Successful Response
     * @throws ApiError
     */
    public static createAlertAlertsPost1(
        requestBody: AlertCreate,
    ): CancelablePromise<AlertResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/alerts',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Alert Status
     * Atualiza o status do alerta (Aceitar, Resolver, Cancelar)
     * @param alertId
     * @param requestBody
     * @returns AlertResponse Successful Response
     * @throws ApiError
     */
    public static updateAlertStatusAlertsAlertIdStatusPatch(
        alertId: string,
        requestBody: AlertUpdateStatus,
    ): CancelablePromise<AlertResponse> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/alerts/{alert_id}/status',
            path: {
                'alert_id': alertId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
