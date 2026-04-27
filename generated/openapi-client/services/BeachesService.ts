/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
import type { BeachResponse } from '../models/BeachResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class BeachesService {
    /**
     * List Beaches
     * Se for MASTER: Retorna todas as praias cadastradas no sistema.
     * Se for CENTRAL/GUARDA/BOMBEIRO: Retorna apenas as praias da sua própria cidade.
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
     * List Beaches By City
     * Retorna praias de uma cidade específica.
     * Apenas Master pode consultar cidades de terceiros.
     * @param cityId
     * @returns BeachResponse Successful Response
     * @throws ApiError
     */
    public static listBeachesByCityBeachesCityCityIdGet(
        cityId: string,
    ): CancelablePromise<Array<BeachResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/beaches/city/{city_id}',
            path: {
                'city_id': cityId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
