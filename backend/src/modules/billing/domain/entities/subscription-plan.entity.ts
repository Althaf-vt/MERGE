import { ErrorCode } from '../../../../shared/domain/enums/error-code.enum';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { BILLING_ERROR_MESSAGES } from '../constants/billing-error-messages.constants';
import { BillingPeriod, SubscriptionEntitlement } from '../enums/billing.enums';
import { CreateSubscriptionPlanProps, SubscriptionPlanData, SubscriptionPlanProps, SubscriptionPlanSnapshot, UpdateSubscriptionPlanProps } from '../interfaces/subscription-plan.types';
import { MoneyVO } from '../value-objects/money.vo';
import { PlanBillingPeriod } from '../value-objects/plan-billing-period.vo';
import { PlanOffer } from '../value-objects/plan-offer.vo';

export class SubscriptionPlan {
    private readonly _props: SubscriptionPlanData;
    private readonly _priceVO: MoneyVO;
    private readonly _billingPeriodVO: PlanBillingPeriod;
    private readonly _offersVO: PlanOffer[];

    constructor(props: SubscriptionPlanProps) {
        this._validateInvariants(props);

        const now = new Date();
        this._priceVO = MoneyVO.create(props.price);
        this._billingPeriodVO = PlanBillingPeriod.create(props.billingPeriod);
        this._offersVO = (props.offers ?? []).map((o) => PlanOffer.create(o));

        this._props = {
            id: props.id.trim(),
            name: props.name.trim(),
            code: props.code.trim().toUpperCase(),
            billingPeriod: props.billingPeriod,
            price: this._priceVO.toJSON(),
            entitlements: Array.from(new Set(props.entitlements)),
            offers: this._offersVO.map((o) => o.toJSON()),
            sortOrder: props.sortOrder ?? 0,
            isActive: props.isActive ?? true,
            createdAt: props.createdAt ?? now,
            updatedAt: props.updatedAt ?? props.createdAt ?? now,
        };
    }

    public static create(props: CreateSubscriptionPlanProps): SubscriptionPlan {
        return new SubscriptionPlan({
            ...props,
            isActive: props.isActive ?? true,
            sortOrder: props.sortOrder ?? 0,
        });
    }

    private _validateInvariants(props: SubscriptionPlanProps): void {
        if (!props.id || props.id.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.PLAN_ID_REQUIRED);
        }

        if (!props.name || props.name.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.PLAN_NAME_REQUIRED);
        }

        if (!props.code || props.code.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.PLAN_CODE_REQUIRED);
        }

        if (!props.billingPeriod || !Object.values(BillingPeriod).includes(props.billingPeriod)) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.INVALID_PERIOD);
        }

        if (!props.price) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.INVALID_AMOUNT);
        }

        if (!props.entitlements || props.entitlements.length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.ENTITLEMENTS_REQUIRED);
        }
    }

    get id(): string { return this._props.id; }
    get name(): string { return this._props.name; }
    get code(): string { return this._props.code; }
    get billingPeriod(): BillingPeriod { return this._props.billingPeriod; }
    get price(): MoneyVO { return this._priceVO; }
    get entitlements(): SubscriptionEntitlement[] { return [...this._props.entitlements]; }
    get offers(): PlanOffer[] { return [...this._offersVO]; }
    get sortOrder(): number { return this._props.sortOrder; }
    get isActive(): boolean { return this._props.isActive; }
    get createdAt(): Date { return new Date(this._props.createdAt); }
    get updatedAt(): Date { return new Date(this._props.updatedAt); }

    public updateDetails(props: UpdateSubscriptionPlanProps): void {
        const trimmedName = props.name.trim();
        if (!trimmedName) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.PLAN_NAME_REQUIRED);
        }

        if (!props.entitlements || props.entitlements.length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.ENTITLEMENTS_REQUIRED);
        }

        const newPriceVO = MoneyVO.create(props.price);
        const newOffersVO = (props.offers ?? []).map((o) => PlanOffer.create(o));

        this._props.name = trimmedName;
        this._props.price = newPriceVO.toJSON();
        this._props.entitlements = Array.from(new Set(props.entitlements));
        this._props.offers = newOffersVO.map((o) => o.toJSON());
        if (props.sortOrder !== undefined) {
            this._props.sortOrder = props.sortOrder;
        }
        this._props.updatedAt = new Date();
    }

    public activate(): void {
        this._props.isActive = true;
        this._props.updatedAt = new Date();
    }

    public deactivate(): void {
        this._props.isActive = false;
        this._props.updatedAt = new Date();
    }

    public addOffer(offer: PlanOffer): void {
        const existingIndex = this._offersVO.findIndex((o) => o.code === offer.code);
        if (existingIndex >= 0) {
            this._offersVO[existingIndex] = offer;
        } else {
            this._offersVO.push(offer);
        }
        this._props.offers = this._offersVO.map((o) => o.toJSON());
        this._props.updatedAt = new Date();
    }

    public removeOffer(offerCode: string): void {
        const normalized = offerCode.trim().toUpperCase();
        const initialLength = this._offersVO.length;
        const filtered = this._offersVO.filter((o) => o.code !== normalized);
        if (filtered.length !== initialLength) {
            this._offersVO.length = 0;
            this._offersVO.push(...filtered);
            this._props.offers = this._offersVO.map((o) => o.toJSON());
            this._props.updatedAt = new Date();
        }
    }

    public calculateEffectivePrice(date: Date = new Date()): MoneyVO {
        const validOffers = this._offersVO.filter((o) => o.isValidAt(date));
        if (validOffers.length === 0) {
            return this._priceVO;
        }

        // Apply best offer (highest discount percentage)
        const bestOffer = validOffers.reduce((best, curr) =>
            curr.discountPercentage > best.discountPercentage ? curr : best,
        );

        return bestOffer.calculateDiscountedPrice(this._priceVO);
    }

    public hasEntitlement(entitlement: SubscriptionEntitlement): boolean {
        return this._props.entitlements.includes(entitlement);
    }

    public toSnapshot(): SubscriptionPlanSnapshot {
        return {
            id: this._props.id,
            name: this._props.name,
            code: this._props.code,
            billingPeriod: this._props.billingPeriod,
            price: { ...this._props.price },
            entitlements: [...this._props.entitlements],
            offers: this._props.offers.map((o) => ({ ...o })),
            sortOrder: this._props.sortOrder,
            isActive: this._props.isActive,
            createdAt: new Date(this._props.createdAt),
            updatedAt: new Date(this._props.updatedAt),
        };
    }

    public toJSON(): SubscriptionPlanSnapshot {
        return this.toSnapshot();
    }
}
