export const KYC_POLICY = {
    // Number of liveness prompts required to complete verification
    REQUIRED_PROMPTS_COUNT: 4,

    // Liveness confidence thresholds
    LIVENESS_MIN_PASS_THRESHOLD: 0.80,
    LIVENESS_AUTO_APPROVE_THRESHOLD: 0.88,

    // Live selfie confidence thresholds
    SELFIE_MIN_PASS_THRESHOLD: 80,
    SELFIE_AUTO_APPROVE_THRESHOLD: 90,

    // Photo face match policy thresholds
    MIN_FACE_MATCH_CONFIDENCE: 80,
    MAX_FACE_MATCH_AUTO_APPROVE_DISTANCE: 20.0,
    FAILED_FACE_MATCH_SENTINEL_SCORE: 999,
} as const;