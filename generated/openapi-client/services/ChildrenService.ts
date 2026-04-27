/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_upload_child_photo_children__child_id__photo_post } from '../models/Body_upload_child_photo_children__child_id__photo_post';
import type { ChildCreate } from '../models/ChildCreate';
import type { ChildPhotoPolicyResponse } from '../models/ChildPhotoPolicyResponse';
import type { ChildResponse } from '../models/ChildResponse';
import type { ChildUpdate } from '../models/ChildUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ChildrenService {
    /**
     * List Children
     * @returns ChildResponse Successful Response
     * @throws ApiError
     */
    public static listChildrenChildrenGet(): CancelablePromise<Array<ChildResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/children/',
        });
    }
    /**
     * Create Child
     * @param requestBody
     * @returns ChildResponse Successful Response
     * @throws ApiError
     */
    public static createChildChildrenPost(
        requestBody: ChildCreate,
    ): CancelablePromise<ChildResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/children/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Child Photo Policy
     * @param childId
     * @returns ChildPhotoPolicyResponse Successful Response
     * @throws ApiError
     */
    public static getChildPhotoPolicyChildrenChildIdPhotoPolicyGet(
        childId: string,
    ): CancelablePromise<ChildPhotoPolicyResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/children/{child_id}/photo-policy',
            path: {
                'child_id': childId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Child
     * @param childId
     * @returns ChildResponse Successful Response
     * @throws ApiError
     */
    public static getChildChildrenChildIdGet(
        childId: string,
    ): CancelablePromise<ChildResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/children/{child_id}',
            path: {
                'child_id': childId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Child
     * @param childId
     * @param requestBody
     * @returns ChildResponse Successful Response
     * @throws ApiError
     */
    public static updateChildChildrenChildIdPut(
        childId: string,
        requestBody: ChildUpdate,
    ): CancelablePromise<ChildResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/children/{child_id}',
            path: {
                'child_id': childId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Child
     * @param childId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteChildChildrenChildIdDelete(
        childId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/children/{child_id}',
            path: {
                'child_id': childId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Upload Child Photo
     * @param childId
     * @param formData
     * @returns any Successful Response
     * @throws ApiError
     */
    public static uploadChildPhotoChildrenChildIdPhotoPost(
        childId: string,
        formData: Body_upload_child_photo_children__child_id__photo_post,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/children/{child_id}/photo',
            path: {
                'child_id': childId,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
