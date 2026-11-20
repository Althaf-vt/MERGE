import { ConnectionStatus } from "../enums/connection.enums";

export interface ConnectionProps {
    id?: string;
    requesterId: string;
    recipientId: string;
    status?: ConnectionStatus;
    respondedAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateConnectionProps {
    requesterId: string;
    recipientId: string;
}

export interface InternalConnectionProps {
    id: string;
    requesterId: string;
    recipientId: string;
    status: ConnectionStatus;
    respondedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface ConnectionSnapshot {
    id: string;
    requesterId: string;
    recipientId: string;
    status: ConnectionStatus;
    respondedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
