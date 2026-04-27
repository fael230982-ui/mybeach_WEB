/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
import type { AlertCreate } from '../models/AlertCreate';
import type { AlertResponse } from '../models/AlertResponse';
import type { AlertUpdateStatus } from '../models/AlertUpdateStatus';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AlertsDispatchEngineService {
    /**
     * List Alerts
     * Motor inteligente de distribuição.
     * Só entrega o alerta se a pessoa estiver na distância correta.
     * @returns AlertResponse Successful Response
     * @throws ApiError
     */
    public static listAlertsAlertsGet(): CancelablePromise<Array<AlertResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/alerts/',
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
     * Update Alert Status
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
