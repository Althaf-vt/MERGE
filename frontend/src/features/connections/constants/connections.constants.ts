import type {
    ConnectionRole,
    ConnectionStatus,
    ConnectionsTab,
    PrivateListType,
} from "../types/connections.types";

export const CONNECTIONS_PAGINATION_DEFAULTS = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 50,
} as const;

export const CONNECTIONS_TABS_CONFIG: readonly { key: ConnectionsTab; label: string; description: string }[] = [
    { 
        key: 'ACTIVE', 
        label: 'Active',
        description: 'Mutual matches and ongoing conversations' 
    },
    { 
        key: 'PENDING', 
        label: 'Pending',
        description: 'Connection requests awaiting response' 
    },
    { 
        key: 'SHORTLISTED', 
        label: 'Shortlisted',
        description: 'Profiles saved to connect with soon' 
    },
    { 
        key: 'REVIEW_LATER', 
        label: 'Review Later',
        description: 'Profiles put on hold from discovery' 
    },
] as const;

export const CONNECTIONS_QUERY_CONFIG = {
    ACTIVE: {
        role: 'BOTH' as ConnectionRole,
        status: 'ACCEPTED' as ConnectionStatus,
        page: CONNECTIONS_PAGINATION_DEFAULTS.DEFAULT_PAGE,
        limit: CONNECTIONS_PAGINATION_DEFAULTS.DEFAULT_LIMIT,
    },
    PENDING: {
        role: 'BOTH' as ConnectionRole,
        status: 'PENDING' as ConnectionStatus,
        page: CONNECTIONS_PAGINATION_DEFAULTS.DEFAULT_PAGE,
        limit: CONNECTIONS_PAGINATION_DEFAULTS.DEFAULT_LIMIT,
    },
    PENDING_RECEIVED: {
        role: 'RECIPIENT' as ConnectionRole,
        status: 'PENDING' as ConnectionStatus,
        page: CONNECTIONS_PAGINATION_DEFAULTS.DEFAULT_PAGE,
        limit: CONNECTIONS_PAGINATION_DEFAULTS.DEFAULT_LIMIT,
    },
    PENDING_SENT: {
        role: 'REQUESTER' as ConnectionRole,
        status: 'PENDING' as ConnectionStatus,
        page: CONNECTIONS_PAGINATION_DEFAULTS.DEFAULT_PAGE,
        limit: CONNECTIONS_PAGINATION_DEFAULTS.DEFAULT_LIMIT,
    },
    SHORTLISTED: {
        listType: 'SHORTLIST' as PrivateListType,
        page: CONNECTIONS_PAGINATION_DEFAULTS.DEFAULT_PAGE,
        limit: CONNECTIONS_PAGINATION_DEFAULTS.DEFAULT_LIMIT,
    },
    REVIEW_LATER: {
        listType: 'REVIEW_LATER' as PrivateListType,
        page: CONNECTIONS_PAGINATION_DEFAULTS.DEFAULT_PAGE,
        limit: CONNECTIONS_PAGINATION_DEFAULTS.DEFAULT_LIMIT,
    },
} as const;

export const PRIORITY_INTRO_LIMITS = {
    MAX_LENGTH: 200,
    CREDIT_COST: 1,
} as const;

export const CONNECTIONS_ACTION_LABELS = {
    ACCEPT: 'Accept',
    DECLINE: 'Decline',
    CANCEL: 'Cancel Request',
    REVOKE: 'Revoke Match',
    CONNECT: 'Connect',
    PRIORITY_INTRO: 'Priority Intro',
    REMOVE: 'Remove',
    MOVE_TO_SHORTLIST: 'Shortlist',
    MOVE_TO_REVIEW_LATER: 'Review Later',
} as const;
