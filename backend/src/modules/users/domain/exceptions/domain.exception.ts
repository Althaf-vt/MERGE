import { ErrorCode } from "../enums/error-code.enum";

export class DomainException extends Error {
    constructor(
        public readonly code: ErrorCode,
        public readonly message: string,
    ) {
        super(message);
        this.name = 'DomainException';
    }
}