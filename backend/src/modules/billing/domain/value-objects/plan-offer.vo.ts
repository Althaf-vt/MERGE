import { ErrorCode } from '../../../../shared/domain/enums/error-code.enum';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { BILLING_ERROR_MESSAGES } from '../constants/billing-error-messages.constants';
import { PlanOfferProps } from '../interfaces/billing-value-objects.types';
import { MoneyVO } from './money.vo';

export class PlanOffer {
    private readonly _code: string;
    private readonly _discountPercentage: number;
    private readonly _validFrom: Date;
    private readonly _validUntil: Date;
    private readonly _isActive: boolean;

    constructor(props: PlanOfferProps) {
        this._validateInvariants(props);

        this._code = props.code.trim().toUpperCase();
        this._discountPercentage = Math.round(props.discountPercentage);
        this._validFrom = new Date(props.validFrom);
        this._validUntil = new Date(props.validUntil);
        this._isActive = props.isActive;
    }

    public static create(props: PlanOfferProps): PlanOffer {
        return new PlanOffer(props);
    }

    private _validateInvariants(props: PlanOfferProps): void {
        if (!props) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.OFFER_CODE_REQUIRED);
        }

        if (!props.code || props.code.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.OFFER_CODE_REQUIRED);
        }

        if (
            typeof props.discountPercentage !== 'number' ||
            isNaN(props.discountPercentage) ||
            props.discountPercentage <= 0 ||
            props.discountPercentage > 100
        ) {
            throw new DomainException(
                ErrorCode.VALIDATION_FAILED,
                BILLING_ERROR_MESSAGES.INVALID_DISCOUNT_PERCENTAGE,
            );
        }

        if (!props.validFrom || !(props.validFrom instanceof Date) || isNaN(props.validFrom.getTime())) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.INVALID_OFFER_DATES);
        }

        if (!props.validUntil || !(props.validUntil instanceof Date) || isNaN(props.validUntil.getTime())) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.INVALID_OFFER_DATES);
        }

        if (props.validUntil.getTime() < props.validFrom.getTime()) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.INVALID_OFFER_DATES);
        }
    }

    get code(): string { return this._code; }
    get discountPercentage(): number { return this._discountPercentage; }
    get validFrom(): Date { return new Date(this._validFrom); }
    get validUntil(): Date { return new Date(this._validUntil); }
    get isActive(): boolean { return this._isActive; }

    public isValidAt(date: Date = new Date()): boolean {
        if (!this._isActive) return false;
        const timestamp = date.getTime();
        return timestamp >= this._validFrom.getTime() && timestamp <= this._validUntil.getTime();
    }

    public calculateDiscountedPrice(basePrice: MoneyVO): MoneyVO {
        if (!this.isValidAt()) {
            return basePrice;
        }

        const discountMultiplier = this._discountPercentage / 100;
        const discountAmount = Math.round(basePrice.amount * discountMultiplier * 100) / 100;

        return basePrice.subtract(
            MoneyVO.create({
                amount: discountAmount,
                currency: basePrice.currency,
            }),
        );
    }

    public equals(other: PlanOffer): boolean {
        if (!other) return false;
        return (
            this._code === other.code &&
            this._discountPercentage === other.discountPercentage &&
            this._validFrom.getTime() === other.validFrom.getTime() &&
            this._validUntil.getTime() === other.validUntil.getTime() &&
            this._isActive === other.isActive
        );
    }

    public toJSON(): PlanOfferProps {
        return {
            code: this._code,
            discountPercentage: this._discountPercentage,
            validFrom: new Date(this._validFrom),
            validUntil: new Date(this._validUntil),
            isActive: this._isActive,
        };
    }
}
