// Represents an email as a value object, validating and normalizing the email
// while keeping its value immutable and providing value-based comaprison.

export class EmailVO{
    private readonly _value: string;

    constructor(email: string){
        if(!email || !this.validate(email)){
            throw new Error('Invalid email format');
        }
        this._value = email.toLocaleLowerCase().trim();
    }

    private validate(email: string): boolean{
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    getValue(): string{
        return this._value;
    }

    // Compares two EmailVO objects based on their email values.
    equals(other: EmailVO): boolean{
        return this._value === other.getValue();
    }
}