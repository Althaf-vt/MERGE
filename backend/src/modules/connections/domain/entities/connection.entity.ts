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

export class ConnectionAggregate extends AggregateRoot {
    private _props: Required<ConnectionProps>;

    constructor(props: ConnectionProps) {
        super();
        this._props = {
            ...props,
            id: props.id ?? '',
            status: props.status ?? ConnectionStatus.PENDING,
            isPriority: props.isPriority ?? false,
            icebreakerMessage: props.icebreakerMessage ?? undefined,
            respondedAt: props.respondedAt ?? null,
            createdAt: props.createdAt ?? new Date(),
            updatedAt: props.updatedAt ?? new Date(),
        } as Required<ConnectionProps>;
    }

    get id(): string { return this._props.id; }
    get requesterId(): string { return this._props.requesterId; }
    get recipientId(): string { return this._props.recipientId; }
    get status(): ConnectionStatus { return this._props.status; }
    get isPriority(): boolean { return this._props.isPriority; }
    get icebreakerMessage(): string | undefined { return this._props.icebreakerMessage; }
    get createdAt(): Date { return this._props.createdAt; }
    get updatedAt(): Date { return this._props.updatedAt; }

    public accept(actionUserId: string): void {
        if (this._props.recipientId !== actionUserId) {
            throw new DomainException(ErrorCode.FORBIDDEN, 'Only the recipient can accept a connection request.');
        }
        if (this._props.status !== ConnectionStatus.PENDING) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, `Cannot accept a request that is currently ${this._props.status}.`);
        }
        this._props.status = ConnectionStatus.ACCEPTED;
        this._props.respondedAt = new Date();
        this._markUpdatedAt();
    }

    public decline(actionUserId: string): void {
        if (this._props.recipientId !== actionUserId) {
            throw new DomainException(ErrorCode.FORBIDDEN, 'Only the recipient can decline a connection request.');
        }
        if (this._props.status !== ConnectionStatus.PENDING) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Only pending requests can be declined.');
        }
        this._props.status = ConnectionStatus.DECLINED;
        this._props.respondedAt = new Date();
        this._markUpdatedAt();
    }

    public cancel(actionUserId: string): void {
        if (this._props.requesterId !== actionUserId) {
            throw new DomainException(ErrorCode.FORBIDDEN, 'Only the requester can cancel a pending connection request.');
        }
        if (this._props.status !== ConnectionStatus.PENDING) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Only pending requests can be cancelled.');
        }
        this._props.status = ConnectionStatus.CANCELLED;
        this._props.respondedAt = new Date();
        this._markUpdatedAt();
    }

    public revoke(actionUserId: string): void {
        if (this._props.requesterId !== actionUserId && this._props.recipientId !== actionUserId) {
            throw new DomainException(ErrorCode.FORBIDDEN, 'You are not a participant in this connection.');
        }
        if (this._props.status !== ConnectionStatus.ACCEPTED) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Only active matches can be revoked.');
        }
        this._props.status = ConnectionStatus.REVOKED;
        this._props.respondedAt = new Date();
        this._markUpdatedAt();
    }

    private _markUpdatedAt(): void {
        this._props.updatedAt = new Date();
    }

    public toJSON(): Record<string, unknown> {
        return { ...this._props };
    }
}