/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AuditLogResponse = {
    id: string;
    user: string;
    user_id?: (string | null);
    user_role: string;
    action: string;
    resource_type: string;
    resource_id?: (string | null);
    endpoint?: (string | null);
    status: string;
    details?: (string | null);
    ip_address: string;
    created_at: string;
};

