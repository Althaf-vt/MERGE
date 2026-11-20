import { AggregateRoot } from "../../../../shared/domain/events/aggregate-root";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { DiscoveryPassProps, DiscoveryPassSnapshot, InternalDiscoveryPassProps } from "../interfaces/discovery-pass.types";
import { DISCOVERY_ERROR_MESSAGES } from "../constants/discovery-error-messages.constant";

export class DiscoveryPass extends AggregateRoot {
    private _props: InternalDiscoveryPassProps;

    constructor(props: DiscoveryPassProps) {
        super();
        this._validate(props);
        this._props = {
            ...props,
            userId: props.userId.trim(),
            targetUserId: props.targetUserId.trim(),
            createdAt: props.createdAt ?? new Date(),
        };
    }

    private _validate(props: DiscoveryPassProps): void {
        const userId = props.userId?.trim();
        const targetUserId = props.targetUserId?.trim();

        if (!userId) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, DISCOVERY_ERROR_MESSAGES.USER_ID_REQUIRED);
        }

        if (!targetUserId) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, DISCOVERY_ERROR_MESSAGES.TARGET_USER_REQUIRED);
        }

        if (userId === targetUserId) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, DISCOVERY_ERROR_MESSAGES.CANNOT_PASS_SELF);
        }
    }

    get id(): string | undefined {
        return this._props.id;
    }

    get userId(): string {
        return this._props.userId;
    }

    get targetUserId(): string {
        return this._props.targetUserId;
    }

    get createdAt(): Date {
        return this._props.createdAt;
    }

    toJSON(): DiscoveryPassSnapshot {
        return {
            ...this._props,
        };
    }
}
