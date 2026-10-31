import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { AggregateRoot } from "../../../../shared/domain/events/aggregate-root";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ConnectionStatus } from "../enums/connection.enums";

export interface ConnectionProps {
    id?: string;
    requesterId: string;
    recipientId: string;
    status?: ConnectionStatus;
    isPriority?: boolean;
    icebreakerMessage?: string;
    respondedAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export type ConnectionData = Required<Omit<ConnectionProps, 'icebreakerMessage'>> & {
    icebreakerMessage?: string;
};

export class ConnectionAggregate extends AggregateRoot {
    private readonly _props: ConnectionData;

    constructor(props: ConnectionProps) {
        super();
        this._validateInvariants(props);

        this._props = {
            id: props.id ?? '',
            requesterId: props.requesterId.trim(),
            recipientId: props.recipientId.trim(),
            status: props.status ?? ConnectionStatus.PENDING,
            isPriority: props.isPriority ?? false,
            icebreakerMessage: props.icebreakerMessage?.trim() || undefined,
            respondedAt: props.respondedAt ?? null,
            createdAt: props.createdAt ?? new Date(),
            updatedAt: props.updatedAt ?? new Date(),
        };
    }

    private _validateInvariants(props: ConnectionProps): void {
        if (!props.requesterId?.trim() || !props.recipientId?.trim()) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Requester ID and Recipient ID are required.');
        }

        if (props.requesterId.trim() === props.recipientId.trim()) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'A user cannot connect with themselves.');
        }

        if (props.icebreakerMessage && props.icebreakerMessage.length > 500) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Icebreaker message cannot exceed 500 characters.');
        }

        if (props.isPriority && props.icebreakerMessage !== undefined && !props.icebreakerMessage.trim()) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Priority introductions require an icebreaker message.');
        }
    }

    // Getters
    get id(): string { return this._props.id; }
    get requesterId(): string { return this._props.requesterId; }
    get recipientId(): string { return this._props.recipientId; }
    get status(): ConnectionStatus { return this._props.status; }
    get isPriority(): boolean { return this._props.isPriority; }
    get icebreakerMessage(): string | undefined { return this._props.icebreakerMessage; }
    get respondedAt(): Date | null { return this._props.respondedAt; }
    get createdAt(): Date { return this._props.createdAt; }
    get updatedAt(): Date { return this._props.updatedAt; }

    // Domain Queries
    public isParticipant(userId: string): boolean {
        return this._props.requesterId === userId || this._props.recipientId === userId;
    }

    public getPartnerId(userId: string): string {
        if (!this.isParticipant(userId)) {
            throw new DomainException(ErrorCode.FORBIDDEN, 'User is not a participant in this connection.');
        }
        return this._props.requesterId === userId ? this._props.recipientId : this._props.requesterId;
    }

    public isPending(): boolean {
        return this._props.status === ConnectionStatus.PENDING;
    }

    public isAccepted(): boolean {
        return this._props.status === ConnectionStatus.ACCEPTED;
    }

    // State Transitions
    public accept(actionUserId: string): void {
        if (this._props.recipientId !== actionUserId) {
            throw new DomainException(ErrorCode.FORBIDDEN, 'Only the recipient can accept a connection request.');
        }
        if (this._props.status !== ConnectionStatus.PENDING) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, `Cannot accept a connection with status ${this._props.status}.`);
        }

        this._transitionStatus(ConnectionStatus.ACCEPTED);
    }

    public decline(actionUserId: string): void {
        if (this._props.recipientId !== actionUserId) {
            throw new DomainException(ErrorCode.FORBIDDEN, 'Only the recipient can decline a connection request.');
        }
        if (this._props.status !== ConnectionStatus.PENDING) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, `Cannot decline a connection with status ${this._props.status}.`);
        }

        this._transitionStatus(ConnectionStatus.DECLINED);
    }

    public cancel(actionUserId: string): void {
        if (this._props.requesterId !== actionUserId) {
            throw new DomainException(ErrorCode.FORBIDDEN, 'Only the requester can cancel a pending connection request.');
        }
        if (this._props.status !== ConnectionStatus.PENDING) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, `Cannot cancel a connection with status ${this._props.status}.`);
        }

        this._transitionStatus(ConnectionStatus.CANCELLED);
    }

    public revoke(actionUserId: string): void {
        if (!this.isParticipant(actionUserId)) {
            throw new DomainException(ErrorCode.FORBIDDEN, 'You are not a participant in this connection.');
        }
        if (this._props.status !== ConnectionStatus.ACCEPTED) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Only active connections can be revoked.');
        }

        this._transitionStatus(ConnectionStatus.REVOKED);
    }

    private _transitionStatus(newStatus: ConnectionStatus): void {
        const now = new Date();
        this._props.status = newStatus;
        this._props.respondedAt = now;
        this._props.updatedAt = now;
    }

    public toJSON(): ConnectionData {
        return { ...this._props };
    }
}