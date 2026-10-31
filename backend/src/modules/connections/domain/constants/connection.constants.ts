export const CONNECTION_CONSTANTS = {
    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 20,
        MAX_LIMIT: 50,
    },
    ICEBREAKER: {
        MAX_LENGTH: 500,
    },
} as const;

export const CONNECTION_ERROR_MESSAGES = {
    PARTICIPANTS_REQUIRED: 'Requester ID and Recipient ID are required.',
    SELF_CONNECTION_FORBIDDEN: 'A user cannot connect with themselves.',
    ICEBREAKER_TOO_LONG: `Icebreaker message cannot exceed ${CONNECTION_CONSTANTS.ICEBREAKER.MAX_LENGTH} characters.`,
    PRIORITY_INTRO_REQUIRES_ICEBREAKER: 'Priority introductions require an icebreaker message.',
    NOT_A_PARTICIPANT: 'User is not a participant in this connection.',
    ONLY_RECIPIENT_CAN_ACCEPT: 'Only the recipient can accept a connection request.',
    INVALID_STATUS_FOR_ACCEPT: (status: string) => `Cannot accept a connection with status ${status}.`,
    ONLY_RECIPIENT_CAN_DECLINE: 'Only the recipient can decline a connection request.',
    INVALID_STATUS_FOR_DECLINE: (status: string) => `Cannot decline a connection with status ${status}.`,
    ONLY_REQUESTER_CAN_CANCEL: 'Only the requester can cancel a pending connection request.',
    INVALID_STATUS_FOR_CANCEL: (status: string) => `Cannot cancel a connection with status ${status}.`,
    ONLY_ACTIVE_CAN_BE_REVOKED: 'Only active connections can be revoked.',
} as const;