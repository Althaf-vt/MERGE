import { ErrorCode } from '../../../../shared/domain/enums/error-code.enum';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { BILLING_ERROR_MESSAGES } from '../constants/billing-error-messages.constants';
import { CreateCreditPackProps, CreditPackData, CreditPackProps, CreditPackSnapshot, UpdateCreditPackProps } from '../interfaces/credit-pack.types';
import { MoneyVO } from '../value-objects/money.vo';
import { PlanOffer } from '../value-objects/plan-offer.vo';

export class CreditPack {
    private readonly _props: CreditPackData;
    private readonly _priceVO: MoneyVO;
    private readonly _offersVO: PlanOffer[];

    constructor(props: CreditPackProps) {
        this._validateInvariants(props);

        const now = new Date();
        this._priceVO = MoneyVO.create(props.price);
        this._offersVO = (props.offers ?? []).map((o) => PlanOffer.create(o));

        this._props = {
            id: props.id.trim(),
            name: props.name.trim(),
            code: props.code.trim().toUpperCase(),
            creditsCount: Math.round(props.creditsCount),
            price: this._priceVO.toJSON(),
            offers: this._offersVO.map((o) => o.toJSON()),
            badge: props.badge?.trim() ?? null,
            sortOrder: props.sortOrder ?? 0,
            isListed: props.isListed ?? true,
            isActive: props.isActive ?? true,
            createdAt: props.createdAt ?? now,
            updatedAt: props.updatedAt ?? props.createdAt ?? now,
        };
    }

    public static create(props: CreateCreditPackProps): CreditPack {
        if (props.offers) {
            PlanOffer.validateNewOffers(props.offers);
        }
        return new CreditPack({
            ...props,
            isListed: props.isListed ?? true,
            isActive: props.isActive ?? true,
            sortOrder: props.sortOrder ?? 0,
        });
    }

    private _validateInvariants(props: CreditPackProps): void {
        if (!props.id || props.id.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.CREDIT_PACK_ID_REQUIRED);
        }

        if (!props.name || props.name.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.CREDIT_PACK_NAME_REQUIRED);
        }

        if (!props.code || props.code.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.CREDIT_PACK_CODE_REQUIRED);
        }

        if (typeof props.creditsCount !== 'number' || isNaN(props.creditsCount) || props.creditsCount < 1) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.CREDIT_PACK_MIN_COUNT);
        }

        if (!props.price) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.INVALID_AMOUNT);
        }
    }

    get id(): string { return this._props.id; }
    get name(): string { return this._props.name; }
    get code(): string { return this._props.code; }
    get creditsCount(): number { return this._props.creditsCount; }
    get price(): MoneyVO { return this._priceVO; }
    get offers(): PlanOffer[] { return [...this._offersVO]; }
    get badge(): string | null { return this._props.badge; }
    get sortOrder(): number { return this._props.sortOrder; }
    get isListed(): boolean { return this._props.isListed; }
    get isActive(): boolean { return this._props.isActive; }
    get createdAt(): Date { return new Date(this._props.createdAt); }
    get updatedAt(): Date { return new Date(this._props.updatedAt); }

    public updateDetails(props: UpdateCreditPackProps): void {
        const trimmedName = props.name.trim();
        if (!trimmedName) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.CREDIT_PACK_NAME_REQUIRED);
        }

        if (typeof props.creditsCount !== 'number' || isNaN(props.creditsCount) || props.creditsCount < 1) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.CREDIT_PACK_MIN_COUNT);
        }

        const newPriceVO = MoneyVO.create(props.price);

        if (props.offers !== undefined) {
            PlanOffer.validateOfferUpdate(props.offers, this._offersVO);
            this._offersVO.length = 0;
            this._offersVO.push(...props.offers.map((o) => PlanOffer.create(o)));
            this._props.offers = this._offersVO.map((o) => o.toJSON());
        }

        this._props.name = trimmedName;
        this._props.creditsCount = Math.round(props.creditsCount);
        this._props.price = newPriceVO.toJSON();
        this._props.badge = props.badge !== undefined ? (props.badge?.trim() ?? null) : this._props.badge;
        if (props.sortOrder !== undefined) {
            this._props.sortOrder = props.sortOrder;
        }
        this._props.updatedAt = new Date();
    }

    public addOrUpdateOffer(offer: PlanOffer): void {
        PlanOffer.validateOfferUpdate([offer.toSnapshot()], this._offersVO);
        const existingIndex = this._offersVO.findIndex((o) => o.id === offer.id);
        if (existingIndex >= 0) {
            this._offersVO[existingIndex] = offer;
        } else {
            this._offersVO.push(offer);
        }
        this._props.offers = this._offersVO.map((o) => o.toJSON());
        this._props.updatedAt = new Date();
    }

    public addOffer(offer: PlanOffer): void {
        this.addOrUpdateOffer(offer);
    }

    public removeOffer(offerId: string): void {
        const normalized = offerId.trim();
        const initialLength = this._offersVO.length;
        const filtered = this._offersVO.filter((o) => o.id !== normalized && o.name !== normalized);
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

        return bestOffer.calculateDiscountedPrice(this._priceVO, date);
    }

    public list(): void {
        this._props.isListed = true;
        this._props.updatedAt = new Date();
    }

    public unlist(): void {
        this._props.isListed = false;
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

    public toSnapshot(): CreditPackSnapshot {
        return {
            id: this._props.id,
            name: this._props.name,
            code: this._props.code,
            creditsCount: this._props.creditsCount,
            price: { ...this._props.price },
            offers: this._props.offers.map((o) => ({ ...o })),
            badge: this._props.badge,
            sortOrder: this._props.sortOrder,
            isListed: this._props.isListed,
            isActive: this._props.isActive,
            createdAt: new Date(this._props.createdAt),
            updatedAt: new Date(this._props.updatedAt),
        };
    }

    public toJSON(): CreditPackSnapshot {
        return this.toSnapshot();
    }
}
