import { ErrorCode } from '../../../../shared/domain/enums/error-code.enum';
import { AggregateRoot } from '../../../../shared/domain/events/aggregate-root';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { BILLING_ERROR_MESSAGES } from '../constants/billing-error-messages.constants';
import { CreditAccountData, CreditAccountProps, CreditAccountSnapshot, DeductCreditParams, TopUpCreditParams } from '../interfaces/credit-account.types';

export class CreditAccount extends AggregateRoot {
    private readonly _props: CreditAccountData;

    constructor(props: CreditAccountProps) {
        super();
        this._validateCreationInvariants(props);

        const now = new Date();
        this._props = {
            id: props.id.trim(),
            userId: props.userId.trim(),
            balance: Math.max(0, Math.round(props.balance ?? 0)),
            createdAt: props.createdAt ? new Date(props.createdAt) : now,
            updatedAt: props.updatedAt ? new Date(props.updatedAt) : now,
        };
    }

    public static create(props: CreditAccountProps): CreditAccount {
        return new CreditAccount(props);
    }

    public static initialize(id: string, userId: string, initialBalance: number = 0): CreditAccount {
        return new CreditAccount({
            id,
            userId,
            balance: initialBalance,
        });
    }

    private _validateCreationInvariants(props: CreditAccountProps): void {
        if (!props.id || props.id.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.ACCOUNT_ID_REQUIRED);
        }

        if (!props.userId || props.userId.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.USER_ID_REQUIRED);
        }

        if (typeof props.balance !== 'number' || isNaN(props.balance) || props.balance < 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.AMOUNT_CANNOT_BE_NEGATIVE);
        }
    }

    get id(): string { return this._props.id; }
    get userId(): string { return this._props.userId; }
    get balance(): number { return this._props.balance; }
    get createdAt(): Date { return new Date(this._props.createdAt); }
    get updatedAt(): Date { return new Date(this._props.updatedAt); }

    public hasSufficientBalance(amount: number): boolean {
        return amount > 0 && this._props.balance >= amount;
    }

    public deduct(params: DeductCreditParams): void {
        if (typeof params.amount !== 'number' || isNaN(params.amount) || params.amount <= 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.INVALID_CREDITS_AMOUNT);
        }

        const deductionAmount = Math.round(params.amount);
        if (this._props.balance < deductionAmount) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.INSUFFICIENT_CREDITS);
        }

        this._props.balance -= deductionAmount;
        this._props.updatedAt = new Date();
    }

    public credit(params: TopUpCreditParams): void {
        if (typeof params.amount !== 'number' || isNaN(params.amount) || params.amount <= 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.INVALID_CREDITS_AMOUNT);
        }

        const topUpAmount = Math.round(params.amount);
        this._props.balance += topUpAmount;
        this._props.updatedAt = new Date();
    }

    public toSnapshot(): CreditAccountSnapshot {
        return {
            id: this._props.id,
            userId: this._props.userId,
            balance: this._props.balance,
            createdAt: new Date(this._props.createdAt),
            updatedAt: new Date(this._props.updatedAt),
        };
    }

    public toJSON(): CreditAccountSnapshot {
        return this.toSnapshot();
    }
}
