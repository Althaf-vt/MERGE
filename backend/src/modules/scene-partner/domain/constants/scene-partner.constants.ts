export const SCENE_PARTNER_POLICY = {
    DEFAULT_MAX_DURATION_MINUTES: 20,
    MIN_MESSAGE_LENGTH: 1,
    MAX_MESSAGE_LENGTH: 1000,
    MIN_SCENARIO_TITLE_LENGTH: 3,
    MAX_SCENARIO_TITLE_LENGTH: 100,
    MIN_SCENARIO_PROMPT_LENGTH: 5,
    MAX_SCENARIO_PROMPT_LENGTH: 500,
} as const;

export const SCENE_PARTNER_SAFETY = {
    // Prohibited severe profanity, hate speech, and explicit sexual solicitations (Layer 1 safety)
    PROHIBITED_CONTENT_REGEX: /\b(nude|nudes|horny|slut|bitch|dick|pussy|fuck|asshole|bastard|blowjob|porn|penis|vagina|whore)\b/i,
} as const;

export const SCENE_PARTNER_ERROR_MESSAGES = {
    USER_ID_REQUIRED: 'User ID is required to operate a scene session.',
    SESSION_NOT_FOUND: 'Scene session not found.',
    NOT_SESSION_OWNER: 'You are not authorized to access or modify this scene session.',
    TARGET_USER_REQUIRED_FOR_MATCH: 'Target user ID is required for a match-based simulation.',
    CANNOT_SIMULATE_SELF: 'You cannot create a simulation with yourself.',
    SCENARIO_REQUIRED: 'A valid scenario selection or custom scenario prompt is required.',
    INVALID_STATUS_FOR_TURN: (status: string) => `Cannot send a message to a session with status: ${status}. Session must be in progress.`,
    INVALID_STATUS_FOR_PAUSE: 'Only sessions that are currently in progress can be paused.',
    INVALID_STATUS_FOR_RESUME: 'Only paused sessions can be resumed.',
    INVALID_STATUS_FOR_COMPLETE: 'Session is already completed or cannot be concluded from its current status.',
    DURATION_EXCEEDED: 'Session has exceeded the maximum duration limit. Please conclude the session to view your summary.',
    MESSAGE_EMPTY: 'Message content cannot be empty.',
    MESSAGE_TOO_LONG: (max: number) => `Message content cannot exceed ${max} characters.`,
    SUBSCRIPTION_REQUIRED: 'Scene Partner is a premium capability. An active subscription is required to start a rehearsal session.',
    SIMULATION_REPLY_EMPTY: 'AI simulation reply cannot be empty.',
    COACH_NOTE_REQUIRED: 'Coaching feedback note is required for the simulation turn.',
    COACH_OBSERVATION_REQUIRED: 'Coach observation cannot be empty.',
    COACH_TONE_REQUIRED: 'Coach tone assessment cannot be empty.',
    COACH_PACING_REQUIRED: 'Coach pacing assessment cannot be empty.',
    COACH_NEXT_TIP_REQUIRED: 'Coach next tip cannot be empty.',
    SCENARIO_ID_REQUIRED: 'Scenario ID is required.',
    INVALID_SCENARIO_TITLE_LENGTH: (min: number, max: number) => `Scenario title must be between ${min} and ${max} characters.`,
    INVALID_SCENARIO_PROMPT_LENGTH: (min: number, max: number) => `Scenario prompt context must be between ${min} and ${max} characters.`,
    CREATOR_USER_ID_REQUIRED: 'Custom scenario requires a creator user ID.',
    TARGET_PROFILE_UNAVAILABLE: 'Target match profile is unavailable or no longer interactable.',
    INAPPROPRIATE_CONTENT: 'The scenario or message contains inappropriate language and violates MERGE community safety standards.',
} as const;

