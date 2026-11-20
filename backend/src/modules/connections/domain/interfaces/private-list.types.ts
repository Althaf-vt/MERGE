import { PrivateListType } from "../enums/private-list.enums";

export interface PrivateListProps {
    id?: string;
    userId: string;
    targetUserId: string;
    listType: PrivateListType;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreatePrivateListProps {
    userId: string;
    targetUserId: string;
    listType: PrivateListType;
}

export interface InternalPrivateListProps {
    id: string;
    userId: string;
    targetUserId: string;
    listType: PrivateListType;
    createdAt: Date;
    updatedAt: Date;
}

export interface PrivateListSnapshot {
    id: string;
    userId: string;
    targetUserId: string;
    listType: PrivateListType;
    createdAt: Date;
    updatedAt: Date;
}
