import { ErrorCode } from "../enums/error-code.enum";
import { DomainException } from "../exceptions/domain.exception";
import { SHARED_ERROR_MESSAGES } from "../constants/shared-error-messages.constant";
import { SHARED_VALIDATION_PATTERNS } from "../constants/shared-validation.constant";

export class EmailVO {
    private readonly _value: string;

    constructor(email: string) {
        if (!email || !this.validate(email)) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, SHARED_ERROR_MESSAGES.INVALID_EMAIL_FORMAT);
        }
        this._value = email.toLowerCase().trim();
    }

    private validate(email: string): boolean {
        return SHARED_VALIDATION_PATTERNS.EMAIL.test(email);
    }

    getValue(): string{
        return this._value;
    }

    // Compares two EmailVO objects based on their email values.
    equals(other: EmailVO): boolean{
        return this._value === other.getValue();
    }
}