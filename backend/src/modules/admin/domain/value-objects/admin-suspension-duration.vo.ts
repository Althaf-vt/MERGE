import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { AdminSuspensionUnit } from "../enums/admin.enums";

export class AdminSuspensionDurationVO {
    private readonly _expiresAt: Date;

    constructor(duration: number, unit: AdminSuspensionUnit) {
        if (duration <= 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Suspension duration must be greater than zero.');
        }

        const calculateDate = new Date();
        if (unit === AdminSuspensionUnit.HOURS) {
            calculateDate.setHours(calculateDate.getHours() + duration);
        } else {
            calculateDate.setDate(calculateDate.getDate() + duration);
        }

        this._expiresAt = calculateDate;
    }

    public getExpiresAt(): Date {
        return this._expiresAt;
    }
}