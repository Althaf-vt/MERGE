import { Injectable } from "@nestjs/common";
import { IKycHashService } from "../../domain/interfaces/kyc-service.interface";
import * as crypto from "crypto";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
@Injectable()
export class KycHashService implements IKycHashService {
    private readonly _pepper: string;

    constructor() {
        const pepper = process.env.KYC_HASH_PEPPER;
        if (!pepper || pepper.trim().length === 0) {
            throw new DomainException(ErrorCode.INTERNAL_SERVER_ERROR, 'CRITICAL: KYC_HASH_PEPPER is missing from environment variables.');
        }
        this._pepper = pepper;
    }

    hashDocumentNumber(documentNumber: string, country: string): string {
        // We use SHA-256 for deterministic hashing.
        // This ensures the same ID + Country always produces the exact same hash,
        // allowing us to easily query the DB for duplicates.
        const normalizedId = documentNumber.replace(/\s+/g, '').toUpperCase();
        const normalizeCountry = country.toUpperCase();

        const payload = `${normalizeCountry}:${normalizedId}:${this._pepper}`;

        return crypto.createHash('sha256').update(payload).digest('hex');
    }
}