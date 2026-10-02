import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { BlockReason } from "../enums/user.enums";

export interface BlockedRelationshipProps {
    id?: string;
    blockerId: string;
    blockedId: string;
    reason?: BlockReason;
    createdAt?: Date;
}

export class BlockedRelationship {
    private _props: BlockedRelationshipProps;

    constructor(props: BlockedRelationshipProps) {
        if (props.blockerId === props.blockedId) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, "Users cannot block themselves.");
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

    toJSON() {
        return { ...this._props };
    }
}