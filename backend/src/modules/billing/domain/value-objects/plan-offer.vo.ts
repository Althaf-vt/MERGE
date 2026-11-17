import { ErrorCode } from '../../../../shared/domain/enums/error-code.enum';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { BILLING_ERROR_MESSAGES } from '../constants/billing-error-messages.constants';
import { BILLING_ID_PREFIXES, generateBillingId } from '../constants/billing.constants';
import { PlanOfferProps, PlanOfferSnapshot } from '../interfaces/billing-value-objects.types';
import { MoneyVO } from './money.vo';

export class PlanOffer {
    private readonly _id: string;
    private readonly _name: string;
    private readonly _discountPercentage: number;
    private readonly _validFrom: Date;
    private readonly _validUntil: Date;
    private readonly _isActive: boolean;

    constructor(props: PlanOfferProps) {
        this._validateInvariants(props);

        const assignedId =
            props.id && props.id.trim().length > 0
                ? props.id.trim()
                : generateBillingId(BILLING_ID_PREFIXES.OFFER);

        this._id = assignedId;
        this._name = (props.name ?? props.code ?? '').trim();
        this._discountPercentage = Math.round(props.discountPercentage);
        this._validFrom = new Date(props.validFrom);
        this._validUntil = new Date(props.validUntil);
        this._isActive = Boolean(props.isActive);
    }

    public static create(props: PlanOfferProps): PlanOffer {
        return new PlanOffer(props);
    }

    private _validateInvariants(props: PlanOfferProps): void {
        if (!props) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.OFFER_NAME_REQUIRED);
        }

        const campaignName = (props.name ?? props.code ?? '').trim();
        if (!campaignName || campaignName.length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.OFFER_NAME_REQUIRED);
        }

        if (campaignName.length > 80) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.OFFER_NAME_REQUIRED);
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

        if (props.validUntil.getTime() <= props.validFrom.getTime()) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.INVALID_OFFER_DATES);
        }
    }

    public static validateNewOffers(offers?: PlanOfferProps[], atTime: number = Date.now()): void {
        if (!offers || offers.length === 0) return;
        for (const offer of offers) {
            const untilTime = new Date(offer.validUntil).getTime();
            if (isNaN(untilTime) || untilTime <= atTime) {
                throw new DomainException(
                    ErrorCode.VALIDATION_FAILED,
                    BILLING_ERROR_MESSAGES.OFFER_PAST_DATE_NOT_ALLOWED,
                );
            }
        }
    }

    public static validateOfferUpdate(
        incomingOffers: PlanOfferProps[],
        existingOffers: PlanOffer[],
        atTime: number = Date.now(),
    ): void {
        if (!incomingOffers || incomingOffers.length === 0) return;
        const existingMap = new Map<string, PlanOffer>();
        existingOffers.forEach((o) => {
            if (o.id) existingMap.set(o.id, o);
        });

        for (const offer of incomingOffers) {
            const untilTime = new Date(offer.validUntil).getTime();
            const existing = offer.id ? existingMap.get(offer.id) : undefined;
            const isNew = !existing;
            const expiryModified = existing && existing.validUntil.getTime() !== untilTime;

            if ((isNew || expiryModified) && untilTime <= atTime) {
                throw new DomainException(
                    ErrorCode.VALIDATION_FAILED,
                    BILLING_ERROR_MESSAGES.OFFER_PAST_DATE_NOT_ALLOWED,
                );
            }
        }
    }

    get id(): string { return this._id; }
    get name(): string { return this._name; }
    get code(): string { return this._name; }
    get discountPercentage(): number { return this._discountPercentage; }
    get validFrom(): Date { return new Date(this._validFrom); }
    get validUntil(): Date { return new Date(this._validUntil); }
    get isActive(): boolean { return this._isActive; }

    public isValidAt(date: Date = new Date()): boolean {
        if (!this._isActive) return false;
        const timestamp = date.getTime();
        return timestamp >= this._validFrom.getTime() && timestamp <= this._validUntil.getTime();
    }

    public calculateDiscountedPrice(basePrice: MoneyVO, date: Date = new Date()): MoneyVO {
        if (!this.isValidAt(date)) {
            return basePrice;
        }

        return basePrice.calculateDiscountedPrice(this._discountPercentage);
    }

    public equals(other: PlanOffer): boolean {
        if (!other) return false;
        return (
            this._id === other.id &&
            this._name === other.name &&
            this._discountPercentage === other.discountPercentage &&
            this._validFrom.getTime() === other.validFrom.getTime() &&
            this._validUntil.getTime() === other.validUntil.getTime() &&
            this._isActive === other.isActive
        );
    }

    public toSnapshot(): PlanOfferSnapshot {
        return {
            id: this._id,
            name: this._name,
            code: this._name,
            discountPercentage: this._discountPercentage,
            validFrom: new Date(this._validFrom),
            validUntil: new Date(this._validUntil),
            isActive: this._isActive,
        };
    }

    public toJSON(): PlanOfferSnapshot {
        return this.toSnapshot();
    }
}
