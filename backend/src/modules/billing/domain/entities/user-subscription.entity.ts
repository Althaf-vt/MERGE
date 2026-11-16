import { ErrorCode } from '../../../../shared/domain/enums/error-code.enum';
import { AggregateRoot } from '../../../../shared/domain/events/aggregate-root';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { BILLING_ERROR_MESSAGES } from '../constants/billing-error-messages.constants';
import { SubscriptionEntitlement, SubscriptionStatus } from '../enums/billing.enums';
import { RenewSubscriptionParams, SubscribeUserParams, UserSubscriptionData, UserSubscriptionProps, UserSubscriptionSnapshot } from '../interfaces/user-subscription.types';

export class UserSubscription extends AggregateRoot {
    private readonly _props: UserSubscriptionData;

    constructor(props: UserSubscriptionProps) {
        super();
        this._validateCreationInvariants(props);

        const now = new Date();
        this._props = {
            id: props.id.trim(),
            userId: props.userId.trim(),
            planId: props.planId.trim(),
            status: props.status,
            currentPeriodStart: new Date(props.currentPeriodStart),
            currentPeriodEnd: new Date(props.currentPeriodEnd),
            autoRenew: props.autoRenew ?? true,
            canceledAt: props.canceledAt ? new Date(props.canceledAt) : null,
            cancelReason: props.cancelReason?.trim() ?? null,
            paymentMethodRef: props.paymentMethodRef?.trim() ?? null,
            entitlements: Array.from(new Set(props.entitlements)),
            createdAt: props.createdAt ? new Date(props.createdAt) : now,
            updatedAt: props.updatedAt ? new Date(props.updatedAt) : now,
        };
    }

    public static create(props: UserSubscriptionProps): UserSubscription {
        return new UserSubscription(props);
    }

    public static subscribe(params: SubscribeUserParams): UserSubscription {
        return new UserSubscription({
            id: params.id,
            userId: params.userId,
            planId: params.planId,
            status: SubscriptionStatus.ACTIVE,
            currentPeriodStart: params.periodStart,
            currentPeriodEnd: params.periodEnd,
            autoRenew: params.autoRenew ?? true,
            canceledAt: null,
            cancelReason: null,
            paymentMethodRef: params.paymentMethodRef ?? null,
            entitlements: params.entitlements,
        });
    }

    private _validateCreationInvariants(props: UserSubscriptionProps): void {
        if (!props.id || props.id.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.PLAN_ID_REQUIRED);
        }

        if (!props.userId || props.userId.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.USER_ID_REQUIRED);
        }

        if (!props.planId || props.planId.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.PLAN_ID_REQUIRED);
        }

        if (!props.status || !Object.values(SubscriptionStatus).includes(props.status)) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.INVALID_PERIOD);
        }

        if (!props.currentPeriodStart || !(props.currentPeriodStart instanceof Date) || isNaN(props.currentPeriodStart.getTime())) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.INVALID_PERIOD_DATES);
        }

        if (!props.currentPeriodEnd || !(props.currentPeriodEnd instanceof Date) || isNaN(props.currentPeriodEnd.getTime())) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.INVALID_PERIOD_DATES);
        }

        if (props.currentPeriodEnd.getTime() <= props.currentPeriodStart.getTime()) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.INVALID_PERIOD_DATES);
        }

        if (!props.entitlements || props.entitlements.length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.ENTITLEMENTS_REQUIRED);
        }
    }

    get id(): string { return this._props.id; }
    get userId(): string { return this._props.userId; }
    get planId(): string { return this._props.planId; }
    get status(): SubscriptionStatus { return this._props.status; }
    get currentPeriodStart(): Date { return new Date(this._props.currentPeriodStart); }
    get currentPeriodEnd(): Date { return new Date(this._props.currentPeriodEnd); }
    get autoRenew(): boolean { return this._props.autoRenew; }
    get canceledAt(): Date | null { return this._props.canceledAt ? new Date(this._props.canceledAt) : null; }
    get cancelReason(): string | null { return this._props.cancelReason; }
    get paymentMethodRef(): string | null { return this._props.paymentMethodRef; }
    get entitlements(): SubscriptionEntitlement[] { return [...this._props.entitlements]; }
    get createdAt(): Date { return new Date(this._props.createdAt); }
    get updatedAt(): Date { return new Date(this._props.updatedAt); }

    public isActive(atDate: Date = new Date()): boolean {
        const isEligibleStatus =
            this._props.status === SubscriptionStatus.ACTIVE ||
            this._props.status === SubscriptionStatus.TRIALING ||
            this._props.status === SubscriptionStatus.CANCELED;

        return isEligibleStatus && atDate.getTime() <= this._props.currentPeriodEnd.getTime();
    }

    public isEntitledTo(entitlement: SubscriptionEntitlement, atDate: Date = new Date()): boolean {
        return this.isActive(atDate) && this._props.entitlements.includes(entitlement);
    }

    public cancelAutoRenewal(reason?: string): void {
        if (this._props.status === SubscriptionStatus.EXPIRED || this._props.status === SubscriptionStatus.INACTIVE) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.CANNOT_CANCEL_INACTIVE);
        }

        if (!this._props.autoRenew) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.AUTO_RENEWAL_ALREADY_DISABLED);
        }

        this._props.autoRenew = false;
        this._props.status = SubscriptionStatus.CANCELED;
        this._props.canceledAt = new Date();
        this._props.cancelReason = reason?.trim() ?? 'User requested cancellation';
        this._props.updatedAt = new Date();
    }

    public reactivateAutoRenewal(): void {
        if (this._props.status === SubscriptionStatus.EXPIRED || this._props.status === SubscriptionStatus.INACTIVE) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.CANNOT_CANCEL_INACTIVE);
        }

        if (this._props.autoRenew) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.AUTO_RENEWAL_ALREADY_ENABLED);
        }

        this._props.autoRenew = true;
        this._props.status = SubscriptionStatus.ACTIVE;
        this._props.canceledAt = null;
        this._props.cancelReason = null;
        this._props.updatedAt = new Date();
    }

    public renewPeriod(params: RenewSubscriptionParams): void {
        const newEnd = new Date(params.newPeriodEnd);
        if (isNaN(newEnd.getTime()) || newEnd.getTime() <= this._props.currentPeriodEnd.getTime()) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.INVALID_PERIOD_DATES);
        }

        this._props.currentPeriodStart = new Date(this._props.currentPeriodEnd);
        this._props.currentPeriodEnd = newEnd;
        this._props.status = SubscriptionStatus.ACTIVE;
        if (params.paymentMethodRef) {
            this._props.paymentMethodRef = params.paymentMethodRef.trim();
        }
        this._props.updatedAt = new Date();
    }

    public markPastDue(): void {
        this._props.status = SubscriptionStatus.PAST_DUE;
        this._props.updatedAt = new Date();
    }

    public expire(): void {
        this._props.status = SubscriptionStatus.EXPIRED;
        this._props.autoRenew = false;
        this._props.updatedAt = new Date();
    }

    public toSnapshot(): UserSubscriptionSnapshot {
        return {
            id: this._props.id,
            userId: this._props.userId,
            planId: this._props.planId,
            status: this._props.status,
            currentPeriodStart: new Date(this._props.currentPeriodStart),
            currentPeriodEnd: new Date(this._props.currentPeriodEnd),
            autoRenew: this._props.autoRenew,
            canceledAt: this._props.canceledAt ? new Date(this._props.canceledAt) : null,
            cancelReason: this._props.cancelReason,
            paymentMethodRef: this._props.paymentMethodRef,
            entitlements: [...this._props.entitlements],
            createdAt: new Date(this._props.createdAt),
            updatedAt: new Date(this._props.updatedAt),
        };
    }

    public toJSON(): UserSubscriptionSnapshot {
        return this.toSnapshot();
    }
}
