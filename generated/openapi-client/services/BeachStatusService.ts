/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuthorityStatusUpdate } from '../models/AuthorityStatusUpdate';
import type { AutoStatusUpdate } from '../models/AutoStatusUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class BeachStatusService {
    /**
     * Update Auto Status
     * Rota usada pelo RobÃ´ de Clima (cronjob) para atualizar ondas e vento.
     * @param zoneId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static updateAutoStatusBeachStatusZoneIdAutoPut(
        zoneId: string,
        requestBody: AutoStatusUpdate,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/beach-status/{zone_id}/auto',
            path: {
                'zone_id': zoneId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Zone Status By Authority
     * Atualiza a bandeira e os riscos (TubarÃ£o, Buracos) de uma Zona/Posto.
     * @param zoneId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static updateZoneStatusByAuthorityBeachStatusZoneIdManualPatch(
        zoneId: string,
        requestBody: AuthorityStatusUpdate,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/beach-status/{zone_id}/manual',
            path: {
                'zone_id': zoneId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Beach Status
     * Retorna as condiÃ§Ãµes atuais daquele Posto/Zona para o App (Agora com REDIS).
     * @param zoneId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getBeachStatusBeachStatusZoneIdGet(
        zoneId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/beach-status/{zone_id}',
            path: {
                'zone_id': zoneId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
