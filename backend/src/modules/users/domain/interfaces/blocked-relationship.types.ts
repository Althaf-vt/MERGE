import { BlockReason } from "../enums/user.enums";

export interface BlockedRelationshipProps {
    id?: string;
    blockerId: string;
    blockedId: string;
    reason?: BlockReason;
    createdAt?: Date;
}

export interface BlockedRelationshipSnapshot {
    id?: string;
    blockerId: string;
    blockedId: string;
    reason?: BlockReason;
    createdAt?: Date;
    [key: string]: unknown;
}
