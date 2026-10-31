import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { AggregateRoot } from "../../../../shared/domain/events/aggregate-root";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { CONNECTION_CONSTANTS, CONNECTION_ERROR_MESSAGES } from "../constants/connection.constants";
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
            throw new DomainException(ErrorCode.VALIDATION_FAILED, CONNECTION_ERROR_MESSAGES.PARTICIPANTS_REQUIRED);
        }

        if (props.requesterId.trim() === props.recipientId.trim()) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, CONNECTION_ERROR_MESSAGES.SELF_CONNECTION_FORBIDDEN);
        }

        if (props.icebreakerMessage && props.icebreakerMessage.length > CONNECTION_CONSTANTS.ICEBREAKER.MAX_LENGTH) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, CONNECTION_ERROR_MESSAGES.ICEBREAKER_TOO_LONG);
        }

        if (props.isPriority && (!props.icebreakerMessage || !props.icebreakerMessage.trim())) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, CONNECTION_ERROR_MESSAGES.PRIORITY_INTRO_REQUIRES_ICEBREAKER);
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
            throw new DomainException(ErrorCode.FORBIDDEN, CONNECTION_ERROR_MESSAGES.NOT_A_PARTICIPANT);
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
            throw new DomainException(ErrorCode.FORBIDDEN, CONNECTION_ERROR_MESSAGES.ONLY_RECIPIENT_CAN_ACCEPT);
        }
        if (this._props.status !== ConnectionStatus.PENDING) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, CONNECTION_ERROR_MESSAGES.INVALID_STATUS_FOR_ACCEPT(this._props.status));
        }

        this._transitionStatus(ConnectionStatus.ACCEPTED);
    }

    public decline(actionUserId: string): void {
        if (this._props.recipientId !== actionUserId) {
            throw new DomainException(ErrorCode.FORBIDDEN, CONNECTION_ERROR_MESSAGES.ONLY_RECIPIENT_CAN_DECLINE);
        }
        if (this._props.status !== ConnectionStatus.PENDING) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, CONNECTION_ERROR_MESSAGES.INVALID_STATUS_FOR_DECLINE(this._props.status));
        }

        this._transitionStatus(ConnectionStatus.DECLINED);
    }

    public cancel(actionUserId: string): void {
        if (this._props.requesterId !== actionUserId) {
            throw new DomainException(ErrorCode.FORBIDDEN, CONNECTION_ERROR_MESSAGES.ONLY_REQUESTER_CAN_CANCEL);
        }
        if (this._props.status !== ConnectionStatus.PENDING) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, CONNECTION_ERROR_MESSAGES.INVALID_STATUS_FOR_CANCEL(this._props.status));
        }

        this._transitionStatus(ConnectionStatus.CANCELLED);
    }

    public revoke(actionUserId: string): void {
        if (!this.isParticipant(actionUserId)) {
            throw new DomainException(ErrorCode.FORBIDDEN, CONNECTION_ERROR_MESSAGES.NOT_A_PARTICIPANT);
        }
        if (this._props.status !== ConnectionStatus.ACCEPTED) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, CONNECTION_ERROR_MESSAGES.ONLY_ACTIVE_CAN_BE_REVOKED);
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