export enum ConnectionStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    DECLINED = 'DECLINED',
    CANCELLED = 'CANCELLED',
    REVOKED = 'REVOKED',
}

export enum ConnectionRole {
    REQUESTER = 'REQUESTER',
    RECIPIENT = 'RECIPIENT',
    BOTH = 'BOTH',
}
