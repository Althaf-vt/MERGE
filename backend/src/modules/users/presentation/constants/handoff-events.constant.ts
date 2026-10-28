export const HANDOFF_SOCKET_EVENTS = {
    JOIN_ROOM: 'join-handoff-room',
    STATUS_UPDATE: 'handoff-status-update',
} as const;

export type HandoffSocketEvent = typeof HANDOFF_SOCKET_EVENTS[keyof typeof HANDOFF_SOCKET_EVENTS];