/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
export type BeachStatusResponse = {
    id: string;
    zone_id: string;
    status_level: string;
    temperature: (number | null);
    wind_speed: (number | null);
    wave_height: (number | null);
    water_quality: (string | null);
    uv_index: (number | null);
    auto_alerts: (string | null);
    api_updated_at: string;
    manual_observations: (string | null);
    observation_updated_at: (string | null);
    observation_user_id: (string | null);
};

