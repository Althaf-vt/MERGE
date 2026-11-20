export interface DiscoveryPassProps {
    id?: string;
    userId: string;
    targetUserId: string;
    createdAt?: Date;
}

export interface InternalDiscoveryPassProps {
    id?: string;
    userId: string;
    targetUserId: string;
    createdAt: Date;
}

export interface DiscoveryPassSnapshot {
    id?: string;
    userId: string;
    targetUserId: string;
    createdAt: Date;
}
