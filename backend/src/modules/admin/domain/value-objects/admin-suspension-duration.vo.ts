import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { AdminSuspensionUnit } from "../enums/admin.enums";
import { ADMIN_ERROR_MESSAGES } from "../constants/admin-error-messages.constant";
import { ADMIN_POLICY } from "../constants/admin.constants";

export class AdminSuspensionDurationVO {
    private readonly _expiresAt: Date;

    constructor(duration: number, unit: AdminSuspensionUnit) {
        if (duration < ADMIN_POLICY.MIN_SUSPENSION_DURATION) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, ADMIN_ERROR_MESSAGES.SUSPENSION_DURATION_GREATER_THAN_ZERO);
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