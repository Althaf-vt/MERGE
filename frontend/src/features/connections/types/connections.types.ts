export type ConnectionStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED' | 'REVOKED';
export type ConnectionRole = 'REQUESTER' | 'RECIPIENT' | 'BOTH';
export type PrivateListType = 'SHORTLIST' | 'REVIEW_LATER';
export type ConnectionsTab = 'ACTIVE' | 'PENDING' | 'SHORTLISTED' | 'REVIEW_LATER';
export type PendingDirectionFilter = 'ALL' | 'RECEIVED' | 'SENT';

export interface ConnectionResponseDto {
    id: string;
    partnerId: string;
    partnerName: string;
    partnerPhotoUrl: string | null;
    status: ConnectionStatus;
    isPriority: boolean;
    icebreakerMessage?: string;
    createdAt: string;
    isRequester: boolean;
}

export interface PrivateListResponseDto {
    id: string;
    targetUserId: string;
    targetName: string;
    targetPhotoUrl: string | null;
    listType: PrivateListType;
    createdAt: string;
}

export interface GetConnectionsQuery {
    role: ConnectionRole;
    status: ConnectionStatus[] | string;
    page?: number;
    limit?: number;
}

export interface GetPrivateListQuery {
    listType: PrivateListType;
    page?: number;
    limit?: number;
}

export interface SendConnectionRequestPayload {
    targetUserId: string;
}

export interface SendPriorityIntroPayload {
    targetUserId: string;
    icebreakerMessage: string;
}

export interface AddToPrivateListPayload {
    targetUserId: string;
    listType: PrivateListType;
}

export interface RemoveFromPrivateListPayload {
    targetUserId: string;
}
