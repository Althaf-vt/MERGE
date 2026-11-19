import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { BlockReason } from "../enums/user.enums";
import { BlockedRelationshipProps, BlockedRelationshipSnapshot } from "../interfaces/blocked-relationship.types";
import { USER_ERROR_MESSAGES } from "../constants/user-error-messages.constant";

export class BlockedRelationship {
    private _props: BlockedRelationshipProps;

    constructor(props: BlockedRelationshipProps) {
        if (props.blockerId === props.blockedId) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, USER_ERROR_MESSAGES.CANNOT_BLOCK_SELF);
        }
        this._props = {
            ...props,
            reason: props.reason ?? BlockReason.PERSONAL_PREFERENCE,
            createdAt: props.createdAt ?? new Date(),
        }
    }

    get id(): string | undefined { return this._props.id; }
    get blockerId(): string { return this._props.blockerId; }
    get blockedId(): string { return this._props.blockedId; }
    get reason(): BlockReason | undefined { return this._props.reason; }
    get createdAt(): Date | undefined { return this._props.createdAt; }

    toJSON(): BlockedRelationshipSnapshot {
        return { ...this._props };
    }
}