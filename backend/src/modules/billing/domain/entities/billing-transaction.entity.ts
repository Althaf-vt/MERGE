import { ErrorCode } from '../../../../shared/domain/enums/error-code.enum';
import { AggregateRoot } from '../../../../shared/domain/events/aggregate-root';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { BILLING_ERROR_MESSAGES } from '../constants/billing-error-messages.constants';
import { BILLING_TRANSACTION_DESCRIPTIONS } from '../constants/billing.constants';
import { BillingTransactionType, PaymentEnvironment, TransactionStatus } from '../enums/billing.enums';
import { BillingTransactionData, BillingTransactionProps, BillingTransactionSnapshot, CreateBillingTransactionProps } from '../interfaces/billing-transaction.types';
import { MoneyVO } from '../value-objects/money.vo';

export class BillingTransaction extends AggregateRoot {
    private readonly _props: BillingTransactionData;
    private readonly _amountVO: MoneyVO | null;

    constructor(props: BillingTransactionProps) {
        super();
        this._validateCreationInvariants(props);

        const now = new Date();
        this._amountVO = props.amount ? MoneyVO.create(props.amount) : null;

        this._props = {
            id: props.id.trim(),
            userId: props.userId.trim(),
            type: props.type,
            status: props.status,
            amount: this._amountVO ? this._amountVO.toJSON() : null,
            creditsDelta: Math.round(props.creditsDelta ?? 0),
            description: props.description.trim(),
            referenceId: props.referenceId?.trim() ?? null,
            gatewayPaymentId: props.gatewayPaymentId?.trim() ?? null,
            gatewayOrderId: props.gatewayOrderId?.trim() ?? null,
            receiptNumber: props.receiptNumber?.trim() ?? null,
            environment: props.environment ?? PaymentEnvironment.TEST,
            metadata: props.metadata ? { ...props.metadata } : null,
            createdAt: props.createdAt ? new Date(props.createdAt) : now,
        };
    }

    public static create(props: CreateBillingTransactionProps): BillingTransaction {
        return new BillingTransaction({
            ...props,
            environment: props.environment ?? PaymentEnvironment.TEST,
            createdAt: new Date(),
        });
    }

    public static createSubscriptionPurchase(params: {
        id: string;
        userId: string;
        planId: string;
        planName: string;
        price: MoneyVO;
        gatewayOrderId?: string | null;
        gatewayPaymentId?: string | null;
        receiptNumber?: string | null;
        environment?: PaymentEnvironment;
    }): BillingTransaction {
        return new BillingTransaction({
            id: params.id,
            userId: params.userId,
            type: BillingTransactionType.SUBSCRIPTION_PURCHASE,
            status: TransactionStatus.COMPLETED,
            amount: params.price.toJSON(),
            creditsDelta: 0,
            description: BILLING_TRANSACTION_DESCRIPTIONS.SUBSCRIPTION_PURCHASE(params.planName),
            referenceId: params.planId,
            gatewayOrderId: params.gatewayOrderId ?? null,
            gatewayPaymentId: params.gatewayPaymentId ?? null,
            receiptNumber: params.receiptNumber ?? null,
            environment: params.environment ?? PaymentEnvironment.TEST,
            createdAt: new Date(),
        });
    }

    public static createCreditPurchase(params: {
        id: string;
        userId: string;
        packId: string;
        packName: string;
        creditsCount: number;
        price: MoneyVO;
        gatewayOrderId?: string | null;
        gatewayPaymentId?: string | null;
        receiptNumber?: string | null;
        environment?: PaymentEnvironment;
    }): BillingTransaction {
        return new BillingTransaction({
            id: params.id,
            userId: params.userId,
            type: BillingTransactionType.CREDIT_PURCHASE,
            status: TransactionStatus.COMPLETED,
            amount: params.price.toJSON(),
            creditsDelta: params.creditsCount,
            description: BILLING_TRANSACTION_DESCRIPTIONS.CREDIT_PURCHASE(params.packName, params.creditsCount),
            referenceId: params.packId,
            gatewayOrderId: params.gatewayOrderId ?? null,
            gatewayPaymentId: params.gatewayPaymentId ?? null,
            receiptNumber: params.receiptNumber ?? null,
            environment: params.environment ?? PaymentEnvironment.TEST,
            createdAt: new Date(),
        });
    }

    public static createCreditSpend(params: {
        id: string;
        userId: string;
        creditsDeducted: number;
        description: string;
        referenceId?: string | null;
    }): BillingTransaction {
        return new BillingTransaction({
            id: params.id,
            userId: params.userId,
            type: BillingTransactionType.CREDIT_SPENT,
            status: TransactionStatus.COMPLETED,
            amount: null,
            creditsDelta: -Math.abs(params.creditsDeducted),
            description: params.description,
            referenceId: params.referenceId ?? null,
            gatewayOrderId: null,
            gatewayPaymentId: null,
            receiptNumber: null,
            environment: PaymentEnvironment.TEST,
            createdAt: new Date(),
        });
    }

    private _validateCreationInvariants(props: BillingTransactionProps): void {
        if (!props.id || props.id.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.TRANSACTION_ID_REQUIRED);
        }

        if (!props.userId || props.userId.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.USER_ID_REQUIRED);
        }

        if (!props.type || !Object.values(BillingTransactionType).includes(props.type)) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.INVALID_TRANSACTION_TYPE);
        }

        if (!props.status || !Object.values(TransactionStatus).includes(props.status)) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.INVALID_TRANSACTION_STATUS);
        }

        if (!props.description || props.description.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.TRANSACTION_DESCRIPTION_REQUIRED);
        }
    }

    get id(): string { return this._props.id; }
    get userId(): string { return this._props.userId; }
    get type(): BillingTransactionType { return this._props.type; }
    get status(): TransactionStatus { return this._props.status; }
    get amount(): MoneyVO | null { return this._amountVO; }
    get creditsDelta(): number { return this._props.creditsDelta; }
    get description(): string { return this._props.description; }
    get referenceId(): string | null { return this._props.referenceId; }
    get gatewayPaymentId(): string | null { return this._props.gatewayPaymentId; }
    get gatewayOrderId(): string | null { return this._props.gatewayOrderId; }
    get receiptNumber(): string | null { return this._props.receiptNumber; }
    get environment(): PaymentEnvironment { return this._props.environment; }
    get metadata(): Record<string, string | number | boolean> | null {
        return this._props.metadata ? { ...this._props.metadata } : null;
    }
    get createdAt(): Date { return new Date(this._props.createdAt); }

    public markCompleted(gatewayPaymentId?: string, receiptNumber?: string): void {
        this._props.status = TransactionStatus.COMPLETED;
        if (gatewayPaymentId) {
            this._props.gatewayPaymentId = gatewayPaymentId.trim();
        }
        if (receiptNumber) {
            this._props.receiptNumber = receiptNumber.trim();
        }
    }

    public markFailed(reason?: string): void {
        this._props.status = TransactionStatus.FAILED;
        if (reason) {
            this._props.metadata = {
                ...(this._props.metadata ?? {}),
                failureReason: reason.trim(),
            };
        }
    }

    public toSnapshot(): BillingTransactionSnapshot {
        return {
            id: this._props.id,
            userId: this._props.userId,
            type: this._props.type,
            status: this._props.status,
            amount: this._props.amount ? { ...this._props.amount } : null,
            creditsDelta: this._props.creditsDelta,
            description: this._props.description,
            referenceId: this._props.referenceId,
            gatewayPaymentId: this._props.gatewayPaymentId,
            gatewayOrderId: this._props.gatewayOrderId,
            receiptNumber: this._props.receiptNumber,
            environment: this._props.environment,
            metadata: this._props.metadata ? { ...this._props.metadata } : null,
            createdAt: new Date(this._props.createdAt),
        };
    }

    public toJSON(): BillingTransactionSnapshot {
        return this.toSnapshot();
    }
}
