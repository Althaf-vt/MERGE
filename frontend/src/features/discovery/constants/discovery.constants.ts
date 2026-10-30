export const DEFAULT_DISCOVERY_QUERY = {
    page: 1,
    limit: 20,
    isGlobal: false,
} as const;

export const PRIORITY_INTRO_CONSTANTS = {
    CREDIT_COST: 1,
    MAX_CHARACTERS: 200,
} as const;

export const DISCOVERY_ACTION_LABELS = {
    PASS: 'Pass',
    REVIEW_LATER: 'Review Later',
    SHORTLIST: 'Shortlist',
    CONNECT: 'Connect',
    PRIORITY_INTRO: 'Priority Intro',
} as const;

