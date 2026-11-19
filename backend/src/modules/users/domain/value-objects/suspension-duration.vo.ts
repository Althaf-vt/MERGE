import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { USER_ERROR_MESSAGES } from "../constants/user-error-messages.constant";

export enum SuspensionUnit {
    HOURS = "HOURS",
    DAYS = "DAYS",
}

export class SuspensionDurationVO {
    private readonly _until: Date;

    constructor(value: number, unit: SuspensionUnit) {
        if (!value || value <= 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, USER_ERROR_MESSAGES.SUSPENSION_DURATION_POSITIVE);
        }

        const now = new Date();
        const multiplier = unit === SuspensionUnit.DAYS ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000;
        this._until = new Date(now.getTime() + value * multiplier);
    }

    get until(): Date {
        return this._until;
    }

    isExpired(): boolean {
        return new Date() > this._until;
    }
}