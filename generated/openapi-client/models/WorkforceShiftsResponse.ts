/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { WorkforceShiftItem } from './WorkforceShiftItem';
export type WorkforceShiftsResponse = {
    shift: string;
    generated_at: string;
    active_window_minutes: number;
    active_count: number;
    items: Array<WorkforceShiftItem>;
};

