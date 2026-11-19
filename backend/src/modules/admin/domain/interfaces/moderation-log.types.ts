import { ModerationAction } from "../enums/moderation.enums";

export interface ModerationLogProps {
    id?: string;
    targetUserId: string;
    adminId: string;
    action: ModerationAction;
    reason: string;
    durationContext?: string;
    createdAt?: Date;
}

export interface ModerationLogSnapshot {
    id?: string;
    targetUserId: string;
    adminId: string;
    action: ModerationAction;
    reason: string;
    durationContext?: string;
    createdAt?: Date;
}
