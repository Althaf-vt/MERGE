import { AggregateRoot } from "../../../../shared/domain/events/aggregate-root";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { PrivateListType } from "../enums/private-list.enums";
import { PRIVATE_LIST_ERROR_MESSAGES } from "../constants/private-list.constants";

export interface PrivateListProps {
    id?: string;
    userId: string;
    targetUserId: string;
    listType: PrivateListType;
    createdAt?: Date;
    updatedAt?: Date;
}

export type CreatePrivateListProps = Pick<PrivateListProps, 'userId' | 'targetUserId' | 'listType'>;
export type PrivateListData = Required<PrivateListProps>;

export class PrivateListAggregate extends AggregateRoot {
    private readonly _props: PrivateListData;

    constructor(props: PrivateListProps) {
        super();
        this._validateInvariants(props);

        this._props = {
            id: props.id ?? '',
            userId: props.userId,
            targetUserId: props.targetUserId,
            listType: props.listType,
            createdAt: props.createdAt ?? new Date(),
            updatedAt: props.updatedAt ?? props.createdAt ?? new Date(),
        };
    }

    public static create(props: CreatePrivateListProps): PrivateListAggregate {
        return new PrivateListAggregate(props);
    }

    public moveToShortlist(): void {
        if (this._props.listType === PrivateListType.SHORTLIST) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, PRIVATE_LIST_ERROR_MESSAGES.ALREADY_SHORTLISTED);
        }

        this._props.listType = PrivateListType.SHORTLIST;
        this._props.updatedAt = new Date();
    }

    public moveToReviewLater(): void {
        if (this._props.listType === PrivateListType.REVIEW_LATER) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, PRIVATE_LIST_ERROR_MESSAGES.ALREADY_IN_REVIEW_LATER);
        }

        this._props.listType = PrivateListType.REVIEW_LATER;
        this._props.updatedAt = new Date();
    }

    // Getters
    get id(): string { return this._props.id; }
    get userId(): string { return this._props.userId; }
    get targetUserId(): string { return this._props.targetUserId; }
    get listType(): PrivateListType { return this._props.listType; }
    get createdAt(): Date { return this._props.createdAt; }
    get updatedAt(): Date { return this._props.updatedAt; }

    public toJSON(): PrivateListData {
        return { ...this._props };
    }

    private _validateInvariants(props: PrivateListProps): void {
        if (!props.userId?.trim() || !props.targetUserId?.trim()) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, PRIVATE_LIST_ERROR_MESSAGES.USER_AND_TARGET_REQUIRED);
        }

        if (props.userId.trim() === props.targetUserId.trim()) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, PRIVATE_LIST_ERROR_MESSAGES.CANNOT_LIST_YOURSELF);
        }

        if (props.listType !== PrivateListType.SHORTLIST && props.listType !== PrivateListType.REVIEW_LATER) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, PRIVATE_LIST_ERROR_MESSAGES.INVALID_LIST_TYPE);
        }
    }
}
