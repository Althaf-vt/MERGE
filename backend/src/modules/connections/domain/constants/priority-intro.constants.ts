export const PRIORITY_INTRO_CONSTANTS = {
    ICEBREAKER: {
        MAX_LENGTH: 500,
    },
} as const;

export const PRIORITY_INTRO_DOMAIN_EVENTS = {
    SENT: 'priority_intro.sent',
} as const;

export const PRIORITY_INTRO_ERROR_MESSAGES = {
    PARTICIPANTS_REQUIRED: 'Sender ID and Recipient ID are required.',
    CANNOT_SEND_TO_YOURSELF: 'You cannot send a priority introduction to yourself.',
    ICEBREAKER_REQUIRED: 'Priority introductions require an icebreaker message.',
    ICEBREAKER_TOO_LONG: `Icebreaker message cannot exceed ${PRIORITY_INTRO_CONSTANTS.ICEBREAKER.MAX_LENGTH} characters.`,
    TARGET_PROFILE_UNAVAILABLE: 'Target profile is unavailable.',
} as const;