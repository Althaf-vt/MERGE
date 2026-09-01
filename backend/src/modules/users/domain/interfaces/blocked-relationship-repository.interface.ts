import { BlockedRelationship } from "../entities/blocked-relationship.entity";
import { BlockReason, SortOrder } from "../enums/user.enums";

export const BLOCKED_RELATIONSHIP_REPOSITORY = 'BLOCKED_RELATIONSHIP_REPOSITORY';

export interface BlockedUsersQueryOptions {
    search?: string;
    sortBy?: SortOrder;
}

// Lightweight Read Model for CQRS
export interface BlockedUserReadModel {
    blockedId: string;
    displayName: string | null;
    genderIdentity: string | null;
    customLabel: string | null;
    city: string | null;
    state: string | null;
    avatarUrl: string | null;
    reason: BlockReason;
    blockedAt: Date;
    isDeleted: boolean;
}

export interface IBlockedRelationshipRepository {
    create(relationship: BlockedRelationship): Promise<BlockedRelationship>;
    findByPair(blockerId: string, blockedId: string): Promise<BlockedRelationship | null>;
    findByBlockerId(blockerId: string, options?: BlockedUsersQueryOptions): Promise<BlockedRelationship[]>;
    delete(blockerId: string, blockedId: string): Promise<void>;
    countByBlockerId(blockerId: string): Promise<number>;

    getHydratedBlockedUsers(blockerId: string, options?: BlockedUsersQueryOptions): Promise<BlockedUserReadModel[]>;
}