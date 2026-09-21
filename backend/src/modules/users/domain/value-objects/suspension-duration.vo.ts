import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";

export enum SuspensionUnit {
    HOURS = "HOURS",
    DAYS = "DAYS",
}

export class SuspensionDurationVO {
    private readonly _until: Date;

    constructor(value: number, unit: SuspensionUnit) {
        if (!value || value <= 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, "Suspension duration must be greater than zero");
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