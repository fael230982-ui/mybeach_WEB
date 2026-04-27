/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GuardianConsentCreate } from '../models/GuardianConsentCreate';
import type { GuardianConsentResponse } from '../models/GuardianConsentResponse';
import type { GuardianConsentRevokePayload } from '../models/GuardianConsentRevokePayload';
import type { GuardianNotificationResponse } from '../models/GuardianNotificationResponse';
import type { KidsContentCreate } from '../models/KidsContentCreate';
import type { KidsContentResponse } from '../models/KidsContentResponse';
import type { KidsContentReview } from '../models/KidsContentReview';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class KidsService {
    /**
     * Get Current Guardian Consent
     * @param childProfileId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getCurrentGuardianConsentKidsGuardianConsentsCurrentGet(
        childProfileId?: (string | null),
    ): CancelablePromise<(GuardianConsentResponse | null)> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/kids/guardian-consents/current',
            query: {
                'child_profile_id': childProfileId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Create Guardian Consent
     * @param requestBody
     * @returns GuardianConsentResponse Successful Response
     * @throws ApiError
     */
    public static createGuardianConsentKidsGuardianConsentsPost(
        requestBody: GuardianConsentCreate,
    ): CancelablePromise<GuardianConsentResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/kids/guardian-consents',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Revoke Guardian Consent
     * @param requestBody
     * @returns GuardianConsentResponse Successful Response
     * @throws ApiError
     */
    public static revokeGuardianConsentKidsGuardianConsentsRevokePost(
        requestBody: GuardianConsentRevokePayload,
    ): CancelablePromise<GuardianConsentResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/kids/guardian-consents/revoke',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Kids Content
     * @param limit
     * @param offset
     * @returns KidsContentResponse Successful Response
     * @throws ApiError
     */
    public static listKidsContentKidsContentGet(
        limit: number = 100,
        offset?: number,
    ): CancelablePromise<Array<KidsContentResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/kids/content',
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
     * Create Kids Content
     * @param requestBody
     * @returns KidsContentResponse Successful Response
     * @throws ApiError
     */
    public static createKidsContentKidsContentPost(
        requestBody: KidsContentCreate,
    ): CancelablePromise<KidsContentResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/kids/content',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Kids Content
     * @param contentId
     * @param requestBody
     * @returns KidsContentResponse Successful Response
     * @throws ApiError
     */
    public static updateKidsContentKidsContentContentIdPatch(
        contentId: string,
        requestBody: KidsContentCreate,
    ): CancelablePromise<KidsContentResponse> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/kids/content/{content_id}',
            path: {
                'content_id': contentId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Request Content Publication
     * @param contentId
     * @returns KidsContentResponse Successful Response
     * @throws ApiError
     */
    public static requestContentPublicationKidsContentContentIdRequestPublicationPost(
        contentId: string,
    ): CancelablePromise<KidsContentResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/kids/content/{content_id}/request-publication',
            path: {
                'content_id': contentId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Review Kids Content
     * @param contentId
     * @param requestBody
     * @returns KidsContentResponse Successful Response
     * @throws ApiError
     */
    public static reviewKidsContentKidsContentContentIdReviewPost(
        contentId: string,
        requestBody: KidsContentReview,
    ): CancelablePromise<KidsContentResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/kids/content/{content_id}/review',
            path: {
                'content_id': contentId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Guardian Notifications
     * @param limit
     * @param offset
     * @returns GuardianNotificationResponse Successful Response
     * @throws ApiError
     */
    public static listGuardianNotificationsKidsGuardianNotificationsGet(
        limit: number = 100,
        offset?: number,
    ): CancelablePromise<Array<GuardianNotificationResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/kids/guardian-notifications',
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
     * Mark Guardian Notification As Read
     * @param notificationId
     * @returns GuardianNotificationResponse Successful Response
     * @throws ApiError
     */
    public static markGuardianNotificationAsReadKidsGuardianNotificationsNotificationIdReadPost(
        notificationId: string,
    ): CancelablePromise<GuardianNotificationResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/kids/guardian-notifications/{notification_id}/read',
            path: {
                'notification_id': notificationId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
