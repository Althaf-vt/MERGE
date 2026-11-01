export const DISCOVERY_CONSTANTS = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    PERSONALITY_VECTOR_DIMENSIONS: 1536,
    MEDIA_PRESIGNED_URL_TTL_SECONDS: 3600,
    SCORE_PERCENTAGE_MULTIPLIER: 100,
    LOCAL_SEARCH_RADIUS_KM: 100,
    EARTH_RADIUS_KM: 6378.1,
    // 15 minutes (900s) default in development; configurable via env for 30 days (2592000s) in production
    PASS_TTL_SECONDS: process.env.DISCOVERY_PASS_TTL_SECONDS
        ? parseInt(process.env.DISCOVERY_PASS_TTL_SECONDS, 10)
        : 15 * 60,
} as const;