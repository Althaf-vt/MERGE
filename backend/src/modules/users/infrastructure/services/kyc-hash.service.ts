import { Injectable } from "@nestjs/common";
import { IKycHashService } from "../../domain/interfaces/kyc-service.interface";
import * as crypto from "crypto";
@Injectable()
export class KycHashService implements IKycHashService{
    private readonly pepper = process.env.KYC_HASH_PEPPER || 'default-prepper-string';

    hashDocumentNumber(documentNumber: string, country: string): string {
        // We use SHA-256 for deterministic hashing.
        // This ensures the same ID + Country always produces the exact same hash,
        // allowing us to easily query the DB for duplicates.
        const normalizedId = documentNumber.replace(/\s+/g, '').toUpperCase();
        const normalizeCountry = country.toUpperCase();

        const payload = `${normalizeCountry}:${normalizedId}:${this.pepper}`;

        return crypto.createHash('sha256').update(payload).digest('hex');
    }
}