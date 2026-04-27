/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AdminCreate } from '../models/AdminCreate';
import type { Body_login_auth_login_post } from '../models/Body_login_auth_login_post';
import type { PrivacyConsentPayload } from '../models/PrivacyConsentPayload';
import type { PrivacyConsentResponse } from '../models/PrivacyConsentResponse';
import type { TokenRefreshResponse } from '../models/TokenRefreshResponse';
import type { UserCreate } from '../models/UserCreate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthService {
    /**
     * Register
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static registerAuthRegisterPost(
        requestBody: UserCreate,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/register',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Verify Email
     * @param token
     * @returns any Successful Response
     * @throws ApiError
     */
    public static verifyEmailAuthVerifyEmailGet(
        token: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/auth/verify-email',
            query: {
                'token': token,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Login
     * @param formData
     * @returns any Successful Response
     * @throws ApiError
     */
    public static loginAuthLoginPost(
        formData: Body_login_auth_login_post,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/login',
            formData: formData,
            mediaType: 'application/x-www-form-urlencoded',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Refresh Access Token
     * @returns TokenRefreshResponse Successful Response
     * @throws ApiError
     */
    public static refreshAccessTokenAuthRefreshPost(): CancelablePromise<TokenRefreshResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/refresh',
        });
    }
    /**
     * Get Privacy Consent
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getPrivacyConsentAuthMePrivacyConsentGet(): CancelablePromise<(PrivacyConsentResponse | null)> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/auth/me/privacy-consent',
        });
    }
    /**
     * Accept Privacy Consent
     * @param requestBody
     * @returns PrivacyConsentResponse Successful Response
     * @throws ApiError
     */
    public static acceptPrivacyConsentAuthMePrivacyConsentPost(
        requestBody: PrivacyConsentPayload,
    ): CancelablePromise<PrivacyConsentResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/me/privacy-consent',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Register Admin
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static registerAdminAuthRegisterAdminPost(
        requestBody: AdminCreate,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/register-admin',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
