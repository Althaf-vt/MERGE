import { ErrorCode } from '../../../../shared/domain/enums/error-code.enum';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { BILLING_ERROR_MESSAGES } from '../constants/billing-error-messages.constants';
import { Currency } from '../enums/billing.enums';
import { MoneyProps } from '../interfaces/billing-value-objects.types';

export class MoneyVO {
    private readonly _amount: number;
    private readonly _currency: Currency;

    constructor(props: MoneyProps) {
        this._validateInvariants(props);

        // Normalize to two decimal places
        this._amount = Math.round(props.amount * 100) / 100;
        this._currency = props.currency;
    }

    public static create(props: MoneyProps): MoneyVO {
        return new MoneyVO(props);
    }

    public static fromSubunits(subunits: number, currency: Currency = Currency.INR): MoneyVO {
        if (typeof subunits !== 'number' || isNaN(subunits) || subunits < 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.INVALID_AMOUNT);
        }
        return new MoneyVO({
            amount: subunits / 100,
            currency,
        });
    }

    public static zero(currency: Currency = Currency.INR): MoneyVO {
        return new MoneyVO({ amount: 0, currency });
    }

    private _validateInvariants(props: MoneyProps): void {
        if (!props) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.INVALID_AMOUNT);
        }

        if (typeof props.amount !== 'number' || isNaN(props.amount)) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.INVALID_AMOUNT);
        }

        if (props.amount < 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.AMOUNT_CANNOT_BE_NEGATIVE);
        }

        if (!props.currency || !Object.values(Currency).includes(props.currency)) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.CURRENCY_REQUIRED);
        }
    }

    get amount(): number { return this._amount; }
    get currency(): Currency { return this._currency; }

    public toSubunits(): number {
        return Math.round(this._amount * 100);
    }

    public add(other: MoneyVO): MoneyVO {
        this._assertSameCurrency(other);
        return new MoneyVO({
            amount: this._amount + other.amount,
            currency: this._currency,
        });
    }

    public subtract(other: MoneyVO): MoneyVO {
        this._assertSameCurrency(other);
        if (this._amount < other.amount) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.AMOUNT_CANNOT_BE_NEGATIVE);
        }
        return new MoneyVO({
            amount: this._amount - other.amount,
            currency: this._currency,
        });
    }

    public multiply(factor: number): MoneyVO {
        if (typeof factor !== 'number' || isNaN(factor) || factor < 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.INVALID_AMOUNT);
        }
        return new MoneyVO({
            amount: this._amount * factor,
            currency: this._currency,
        });
    }

    public equals(other: MoneyVO): boolean {
        if (!other) return false;
        return this._amount === other.amount && this._currency === other.currency;
    }

    public format(): string {
        return `${this._currency} ${this._amount.toFixed(2)}`;
    }

    public toJSON(): MoneyProps {
        return {
            amount: this._amount,
            currency: this._currency,
        };
    }

    private _assertSameCurrency(other: MoneyVO): void {
        if (!other || this._currency !== other.currency) {
            throw new DomainException(
                ErrorCode.VALIDATION_FAILED,
                BILLING_ERROR_MESSAGES.CURRENCY_MISMATCH(this._currency, other?.currency ?? 'undefined'),
            );
        }
    }
}
