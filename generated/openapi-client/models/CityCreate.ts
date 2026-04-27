/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
export type CityCreate = {
    name: string;
    /**
     * Sigla do estado com 2 letras
     */
    state: string;
    min_lat?: (number | null);
    max_lat?: (number | null);
    min_lng?: (number | null);
    max_lng?: (number | null);
};

