import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsStrongPasswordConstraint', async: false })
export class IsStrongPasswordConstraint implements ValidatorConstraintInterface {
    validate(value: unknown, _args: ValidationArguments): boolean {
        if (typeof value !== 'string') return false;

        // NIST / OWASP password policy:
        // - At least 8 chars, max 128 chars
        // - At least 1 uppercase letter
        // - At least 1 lowercase letter
        // - At least 1 number
        // - At least 1 special character
        // - No leading/trailing/internal whitespace
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`])[^\s]{8,128}$/;

        return passwordRegex.test(value);
    }

    defaultMessage(_args: ValidationArguments): string {
        return 'Password must be at least 8 characters long, contain 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.';    
    }
}

export function IsStrongPassword(validationOptions?: ValidationOptions) {
    return (object: object, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsStrongPasswordConstraint,
        });
    };
}