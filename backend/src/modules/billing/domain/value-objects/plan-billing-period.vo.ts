import { ErrorCode } from '../../../../shared/domain/enums/error-code.enum';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { BILLING_ERROR_MESSAGES } from '../constants/billing-error-messages.constants';
import { BillingPeriod } from '../enums/billing.enums';
import { PlanBillingPeriodProps } from '../interfaces/billing-value-objects.types';

export class PlanBillingPeriod {
    private readonly _period: BillingPeriod;

    constructor(props: PlanBillingPeriodProps) {
        this._validateInvariants(props);
        this._period = props.period;
    }

    public static create(period: BillingPeriod): PlanBillingPeriod {
        return new PlanBillingPeriod({ period });
    }

    public static monthly(): PlanBillingPeriod {
        return new PlanBillingPeriod({ period: BillingPeriod.MONTHLY });
    }

    public static quarterly(): PlanBillingPeriod {
        return new PlanBillingPeriod({ period: BillingPeriod.QUARTERLY });
    }

    public static annual(): PlanBillingPeriod {
        return new PlanBillingPeriod({ period: BillingPeriod.ANNUAL });
    }

    private _validateInvariants(props: PlanBillingPeriodProps): void {
        if (!props || !props.period) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.PERIOD_REQUIRED);
        }

        if (!Object.values(BillingPeriod).includes(props.period)) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.INVALID_PERIOD);
        }
    }

    get period(): BillingPeriod { return this._period; }

    get durationInDays(): number {
        switch (this._period) {
            case BillingPeriod.MONTHLY:
                return 30;
            case BillingPeriod.QUARTERLY:
                return 90;
            case BillingPeriod.ANNUAL:
                return 365;
            default:
                return 30;
        }
    }

    public calculatePeriodEnd(startDate: Date): Date {
        const endDate = new Date(startDate);
        switch (this._period) {
            case BillingPeriod.MONTHLY:
                endDate.setMonth(endDate.getMonth() + 1);
                break;
            case BillingPeriod.QUARTERLY:
                endDate.setMonth(endDate.getMonth() + 3);
                break;
            case BillingPeriod.ANNUAL:
                endDate.setFullYear(endDate.getFullYear() + 1);
                break;
            default:
                endDate.setDate(endDate.getDate() + 30);
        }
        return endDate;
    }

    public equals(other: PlanBillingPeriod): boolean {
        if (!other) return false;
        return this._period === other.period;
    }

    public toJSON(): BillingPeriod {
        return this._period;
    }
}
