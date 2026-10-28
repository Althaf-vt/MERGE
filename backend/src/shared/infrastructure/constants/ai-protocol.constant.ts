export const AI_MESSAGE_ROLE = {
    SYSTEM: 'system',
    USER: 'user',
    ASSISTANT: 'assistant',
} as const;

export type AiMessageRole = typeof AI_MESSAGE_ROLE[keyof typeof AI_MESSAGE_ROLE];