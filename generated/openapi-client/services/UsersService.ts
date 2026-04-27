/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserActiveResponse } from '../models/UserActiveResponse';
import type { UserCreateAdmin } from '../models/UserCreateAdmin';
import type { UserResponse } from '../models/UserResponse';
import type { UserUpdate } from '../models/UserUpdate';
import type { UserUpdateFCM } from '../models/UserUpdateFCM';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UsersService {
    /**
     * Get Active Guards
     * @param limit
     * @param offset
     * @returns UserActiveResponse Successful Response
     * @throws ApiError
     */
    public static getActiveGuardsUsersActiveGet(
        limit: number = 200,
        offset?: number,
    ): CancelablePromise<UserActiveResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/active',
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
     * Get Me
     * Retorna o perfil do usuÃ¡rio logado via Token JWT.
     * @returns UserResponse Successful Response
     * @throws ApiError
     */
    public static getMeUsersMeGet(): CancelablePromise<UserResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/me',
        });
    }
    /**
     * Create Authority
     * @param requestBody
     * @returns UserResponse Successful Response
     * @throws ApiError
     */
    public static createAuthorityUsersAdminCreatePost(
        requestBody: UserCreateAdmin,
    ): CancelablePromise<UserResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/users/admin-create',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Users
     * @param limit
     * @param offset
     * @returns UserResponse Successful Response
     * @throws ApiError
     */
    public static listUsersUsersGet(
        limit: number = 100,
        offset?: number,
    ): CancelablePromise<Array<UserResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/',
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
     * List Users
     * @param limit
     * @param offset
     * @returns UserResponse Successful Response
     * @throws ApiError
     */
    public static listUsersUsersGet1(
        limit: number = 100,
        offset?: number,
    ): CancelablePromise<Array<UserResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users',
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
     * Get User
     * @param userId
     * @returns UserResponse Successful Response
     * @throws ApiError
     */
    public static getUserUsersUserIdGet(
        userId: string,
    ): CancelablePromise<UserResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/{user_id}',
            path: {
                'user_id': userId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update User
     * @param userId
     * @param requestBody
     * @returns UserResponse Successful Response
     * @throws ApiError
     */
    public static updateUserUsersUserIdPatch(
        userId: string,
        requestBody: UserUpdate,
    ): CancelablePromise<UserResponse> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/users/{user_id}',
            path: {
                'user_id': userId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update User
     * @param userId
     * @param requestBody
     * @returns UserResponse Successful Response
     * @throws ApiError
     */
    public static updateUserUsersUserIdPut(
        userId: string,
        requestBody: UserUpdate,
    ): CancelablePromise<UserResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/users/{user_id}',
            path: {
                'user_id': userId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete User
     * @param userId
     * @returns void
     * @throws ApiError
     */
    public static deleteUserUsersUserIdDelete(
        userId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/users/{user_id}',
            path: {
                'user_id': userId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Fcm Token
     * @param userId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static updateFcmTokenUsersUserIdFcmTokenPatch(
        userId: string,
        requestBody: UserUpdateFCM,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/users/{user_id}/fcm-token',
            path: {
                'user_id': userId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
