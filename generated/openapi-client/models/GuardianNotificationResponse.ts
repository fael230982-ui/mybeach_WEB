/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type GuardianNotificationResponse = {
    id: string;
    guardian_id: string;
    type: string;
    title: string;
    message: string;
    related_child_profile_id?: (string | null);
    related_content_id?: (string | null);
    created_at: string;
    sent_at: string;
    read_at?: (string | null);
};

