/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type GuardianConsentResponse = {
    id: string;
    guardian_id: string;
    child_profile_id?: (string | null);
    consent_version: string;
    accepted_at: string;
    accepted_by_name: string;
    accepted_by_document: string;
    relationship: string;
    audit_id?: (string | null);
    revoked_at?: (string | null);
};

