/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuditoriaService {
    /**
     * Get Audit Logs
     * Retorna os logs para a tela de Auditoria.
     * Acesso restrito apenas para perfis MASTER ou ADMIN.
     * @param limit
     * @param offset
     * @param action
     * @param userId
     * @param resourceId
     * @param dateFrom
     * @param dateTo
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getAuditLogsLogsGet(
        limit: number = 100,
        offset?: number,
        action?: (string | null),
        userId?: (string | null),
        resourceId?: (string | null),
        dateFrom?: (string | null),
        dateTo?: (string | null),
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/logs/',
            query: {
                'limit': limit,
                'offset': offset,
                'action': action,
                'user_id': userId,
                'resource_id': resourceId,
                'date_from': dateFrom,
                'date_to': dateTo,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Audit Logs
     * Retorna os logs para a tela de Auditoria.
     * Acesso restrito apenas para perfis MASTER ou ADMIN.
     * @param limit
     * @param offset
     * @param action
     * @param userId
     * @param resourceId
     * @param dateFrom
     * @param dateTo
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getAuditLogsLogsGet1(
        limit: number = 100,
        offset?: number,
        action?: (string | null),
        userId?: (string | null),
        resourceId?: (string | null),
        dateFrom?: (string | null),
        dateTo?: (string | null),
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/logs',
            query: {
                'limit': limit,
                'offset': offset,
                'action': action,
                'user_id': userId,
                'resource_id': resourceId,
                'date_from': dateFrom,
                'date_to': dateTo,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
