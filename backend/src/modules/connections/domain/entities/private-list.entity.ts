import { AggregateRoot } from "../../../../shared/domain/events/aggregate-root";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { PrivateListType } from "../enums/connection.enums";
import { PRIVATE_LIST_ERROR_MESSAGES } from "../constants/private-list.constants";

export interface PrivateListProps {
    id?: string;
    userId: string;
    targetUserId: string;
    listType: PrivateListType;
    createdAt?: Date;
}

export type PrivateListData = Required<PrivateListProps>;

export class PrivateListAggregate extends AggregateRoot {
    private readonly _props: PrivateListData;

    constructor(props: PrivateListProps) {
        super();
        this._validateInvariants(props);

        this._props = {
            id: props.id ?? '',
            userId: props.userId.trim(),
            targetUserId: props.targetUserId.trim(),
            listType: props.listType,
            createdAt: props.createdAt ?? new Date(),
        };
    }

    private _validateInvariants(props: PrivateListProps): void {
        if (!props.userId?.trim() || !props.targetUserId?.trim()) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, PRIVATE_LIST_ERROR_MESSAGES.USER_AND_TARGET_REQUIRED);
        }

        if (props.userId.trim() === props.targetUserId.trim()) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, PRIVATE_LIST_ERROR_MESSAGES.CANNOT_LIST_YOURSELF);
        }

        if (!Object.values(PrivateListType).includes(props.listType)) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, PRIVATE_LIST_ERROR_MESSAGES.INVALID_LIST_TYPE);
        }
    }

    // Getters
    get id(): string { return this._props.id; }
    get userId(): string { return this._props.userId; }
    get targetUserId(): string { return this._props.targetUserId; }
    get listType(): PrivateListType { return this._props.listType; }
    get createdAt(): Date { return this._props.createdAt; }

    // Domain Queries
    public isOwner(userId: string): boolean {
        return this._props.userId === userId;
    }

    public isTarget(targetUserId: string): boolean {
        return this._props.targetUserId === targetUserId;
    }

    public toJSON(): PrivateListData {
        return { ...this._props };
    }
}