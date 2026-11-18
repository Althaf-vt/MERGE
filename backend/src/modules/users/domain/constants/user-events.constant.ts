import { PHOTO_MODERATION_EVENTS } from "../../../../shared/domain/events/photo-moderation-events.contract";

export const USER_DOMAIN_EVENTS = {
    BANNED: 'user.banned',
    SUSPENDED: 'user.suspended',
    BLOCKED: 'user.blocked',
    UNBLOCKED: 'user.unblocked',
    PHOTO_FLAGGED: PHOTO_MODERATION_EVENTS.USER_PHOTO_FLAGGED,
} as const;

export type UserDomainEventName = typeof USER_DOMAIN_EVENTS[keyof typeof USER_DOMAIN_EVENTS];
