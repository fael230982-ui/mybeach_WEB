/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PostCreate } from '../models/PostCreate';
import type { PostResponse } from '../models/PostResponse';
import type { PostUpdate } from '../models/PostUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PostsService {
    /**
     * List Posts
     * @returns PostResponse Successful Response
     * @throws ApiError
     */
    public static listPostsPostsGet(): CancelablePromise<Array<PostResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/posts/',
        });
    }
    /**
     * Create Post
     * @param requestBody
     * @returns PostResponse Successful Response
     * @throws ApiError
     */
    public static createPostPostsPost(
        requestBody: PostCreate,
    ): CancelablePromise<PostResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/posts/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Posts
     * @returns PostResponse Successful Response
     * @throws ApiError
     */
    public static listPostsPostsGet1(): CancelablePromise<Array<PostResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/posts',
        });
    }
    /**
     * Create Post
     * @param requestBody
     * @returns PostResponse Successful Response
     * @throws ApiError
     */
    public static createPostPostsPost1(
        requestBody: PostCreate,
    ): CancelablePromise<PostResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/posts',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Post
     * @param postId
     * @param requestBody
     * @returns PostResponse Successful Response
     * @throws ApiError
     */
    public static updatePostPostsPostIdPatch(
        postId: string,
        requestBody: PostUpdate,
    ): CancelablePromise<PostResponse> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/posts/{post_id}',
            path: {
                'post_id': postId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Post
     * @param postId
     * @param requestBody
     * @returns PostResponse Successful Response
     * @throws ApiError
     */
    public static updatePostPostsPostIdPut(
        postId: string,
        requestBody: PostUpdate,
    ): CancelablePromise<PostResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/posts/{post_id}',
            path: {
                'post_id': postId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Post
     * @param postId
     * @returns void
     * @throws ApiError
     */
    public static deletePostPostsPostIdDelete(
        postId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/posts/{post_id}',
            path: {
                'post_id': postId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
