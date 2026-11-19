import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { IPkiResult, IPkiVerificationService } from "../../domain/interfaces/kyc-service.interface";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { EnvConfig } from "../../../../shared/infrastructure/config/env.config";
import { USER_ERROR_MESSAGES } from "../../domain/constants/user-error-messages.constant";
import AdmZip from "adm-zip";
import { DOMParser, Document as XmlDocument } from "@xmldom/xmldom";
import { SignedXml } from "xml-crypto";
import * as fs from 'fs';
import * as crypto from 'crypto';

@Injectable()
export class AadhaarPkiService implements IPkiVerificationService, OnModuleInit {
    private readonly _logger = new Logger(AadhaarPkiService.name);
    private _trustedRootCert: crypto.X509Certificate | null = null;
    private _trustedRootCertPem: string = '';

    onModuleInit(): void {
        this._loadRootCertificate();
    }

    private _loadRootCertificate(): void {
        const certPath = EnvConfig.services.aadhaarRootCertPath;
        if (!fs.existsSync(certPath)) {
            this._logger.error(`UIDAI root certificate not found at path: ${certPath}`);
            return;
        }

        try {
            const rawCert = fs.readFileSync(certPath, 'utf-8');
            this._trustedRootCert = new crypto.X509Certificate(rawCert);
            this._trustedRootCertPem = this._trustedRootCert.toString();
            this._logger.log('UIDAI root certificate loaded and validated successfully.');
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            this._logger.error(`Failed to parse UIDAI root certificate: ${message}`);
        }
    }

    private _parseAadhaarDate(dobStr: string): Date {
        if (!dobStr) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, USER_ERROR_MESSAGES.DOB_ATTRIBUTE_MISSING);
        }

        const trimmed = dobStr.trim();

        // Handles DD-MM-YYYY or DD/MM/YYYY
        const dmyMatch = trimmed.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
        if (dmyMatch) {
            const [, day, month, year] = dmyMatch.map(Number);
            return this._createValidatedDate(year, month, day, dobStr);
        }

        // Handles YYYY-MM-DD or YYYY/MM/DD
        const ymdMatch = trimmed.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/);
        if (ymdMatch) {
            const [, year, month, day] = ymdMatch.map(Number);
            return this._createValidatedDate(year, month, day, dobStr);
        }

        // Handles YYYY only format
        if (/^\d{4}$/.test(trimmed)) {
            const year = Number(trimmed);
            return this._createValidatedDate(year, 1, 1, dobStr);
        }

        throw new DomainException(ErrorCode.VALIDATION_FAILED, USER_ERROR_MESSAGES.UNRECOGNIZED_DOB_FORMAT(dobStr));
    }

    private _createValidatedDate(year: number, month: number, day: number, rawInput: string): Date {
        if (month < 1 || month > 12 || day < 1 || day > 31) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, USER_ERROR_MESSAGES.INVALID_DOB_COMPONENTS(rawInput));
        }

        const date = new Date(Date.UTC(year, month - 1, day));
        if (
            date.getUTCFullYear() !== year ||
            date.getUTCMonth() !== month - 1 ||
            date.getUTCDate() !== day
        ) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, USER_ERROR_MESSAGES.INVALID_DOB_ROLLOVER(rawInput));
        }

        if (date.getTime() > Date.now()) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, USER_ERROR_MESSAGES.DOB_FUTURE_NOT_ALLOWED);
        }

        return date;
    }

    private _resolveSigningKey(doc: XmlDocument): string {
        if (!this._trustedRootCert) {
            this._loadRootCertificate();
            if (!this._trustedRootCert) {
                throw new DomainException(
                    ErrorCode.INTERNAL_SERVER_ERROR,
                    USER_ERROR_MESSAGES.ROOT_CERTIFICATE_UNAVAILABLE
                );
            }
        }

        const x509Node = doc.getElementsByTagName("X509Certificate")[0] ||
                         doc.getElementsByTagNameNS("*", "X509Certificate")[0];

        if (!x509Node?.textContent) {
            return this._trustedRootCertPem;
        }

        const rawBase64 = x509Node.textContent.replace(/\s+/g, '');
        const embeddedPem = `-----BEGIN CERTIFICATE-----\n${rawBase64.match(/.{1,64}/g)?.join('\n')}\n-----END CERTIFICATE-----`;

        let embeddedCert: crypto.X509Certificate;
        try {
            embeddedCert = new crypto.X509Certificate(embeddedPem);
        } catch {
            throw new DomainException(ErrorCode.KYC_DOCUMENT_INVALID, USER_ERROR_MESSAGES.EMBEDDED_CERTIFICATE_MALFORMED);
        }

        // Cryptographic Chain of Trust / Trust Anchor Verification
        const isIdenticalCert = embeddedCert.raw.equals(this._trustedRootCert.raw);
        const matchesTrustedPublicKey =
            embeddedCert.publicKey.export({ type: 'spki', format: 'pem' }) ===
            this._trustedRootCert.publicKey.export({ type: 'spki', format: 'pem' });

        let isIssuedByRoot = false;
        try {
            isIssuedByRoot = embeddedCert.verify(this._trustedRootCert.publicKey);
        } catch {
            isIssuedByRoot = false;
        }

        if (!isIdenticalCert && !matchesTrustedPublicKey && !isIssuedByRoot) {
            this._logger.warn('Aadhaar XML embedded certificate is not signed by or matching the UIDAI root certificate.');
            throw new DomainException(
                ErrorCode.AADHAAR_VERIFICATION_FAILED,
                USER_ERROR_MESSAGES.CERTIFICATE_UNTRUSTED
            );
        }

        // Validate certificate validity window
        const now = Date.now();
        const validFrom = new Date(embeddedCert.validFrom).getTime();
        const validTo = new Date(embeddedCert.validTo).getTime();

        if (now < validFrom || now > validTo) {
            throw new DomainException(
                ErrorCode.AADHAAR_VERIFICATION_FAILED,
                USER_ERROR_MESSAGES.CERTIFICATE_EXPIRED_OR_NOT_YET_VALID
            );
        }

        return embeddedPem;
    }

    async verifyAadhaarXml(zipBuffer: Buffer, shareCode: string): Promise<IPkiResult> {
        try {
            if (!zipBuffer || zipBuffer.length === 0) {
                throw new DomainException(ErrorCode.VALIDATION_FAILED, USER_ERROR_MESSAGES.ZIP_BUFFER_EMPTY_OR_INVALID);
            }

            const cleanShareCode = shareCode?.trim();
            if (!cleanShareCode || !/^\d{4}$/.test(cleanShareCode)) {
                throw new DomainException(ErrorCode.VALIDATION_FAILED, USER_ERROR_MESSAGES.VALID_4_DIGIT_SHARE_CODE_REQUIRED);
            }

            // 1. Unzip the password-protected file
            let zip: AdmZip;
            try {
                zip = new AdmZip(zipBuffer);
            } catch {
                throw new DomainException(ErrorCode.KYC_DOCUMENT_INVALID, USER_ERROR_MESSAGES.FILE_NOT_VALID_ZIP);
            }

            const zipEntries = zip.getEntries();
            const xmlEntry = zipEntries.find(entry => !entry.isDirectory && entry.entryName.toLowerCase().endsWith('.xml'));

            if (!xmlEntry) {
                throw new DomainException(ErrorCode.KYC_DOCUMENT_INVALID, USER_ERROR_MESSAGES.NO_VALID_XML_IN_ZIP);
            }

            // 2. Extract raw XML using 4-digit share code
            let xmlBuffer: Buffer;
            try {
                xmlBuffer = xmlEntry.getData(cleanShareCode);
            } catch {
                throw new DomainException(ErrorCode.KYC_DOCUMENT_INVALID, USER_ERROR_MESSAGES.INVALID_SHARE_CODE_DECRYPT_ZIP);
            }

            if (!xmlBuffer || xmlBuffer.length === 0) {
                throw new DomainException(ErrorCode.KYC_DOCUMENT_INVALID, USER_ERROR_MESSAGES.INVALID_SHARE_CODE_DECRYPT_XML);
            }

            const xmlString = xmlBuffer.toString('utf-8');

            // 3. Parse XML DOM
            const doc = new DOMParser({
                errorHandler: (level: 'warning' | 'error' | 'fatalError', msg: string) => {
                    if (level === 'error' || level === 'fatalError') {
                        throw new DomainException(ErrorCode.KYC_DOCUMENT_INVALID, USER_ERROR_MESSAGES.XML_PARSING_ERROR(msg));
                    }
                }
            }).parseFromString(xmlString, 'text/xml');

            // 4. Resolve signing key and verify digital signature
            const signature = doc.getElementsByTagNameNS("http://www.w3.org/2000/09/xmldsig#", "Signature")[0] ||
                              doc.getElementsByTagName("ds:Signature")[0] ||
                              doc.getElementsByTagName("Signature")[0];

            if (!signature) {
                throw new DomainException(ErrorCode.KYC_DOCUMENT_INVALID, USER_ERROR_MESSAGES.DIGITAL_SIGNATURE_MISSING);
            }

            const signingKeyPem = this._resolveSigningKey(doc);
            const sig = new SignedXml({ publicCert: signingKeyPem });
            sig.loadSignature(signature.toString());

            const isValid = sig.checkSignature(xmlString);
            if (!isValid) {
                this._logger.warn('Digital signature cryptographic verification failed on Aadhaar XML.');
                throw new DomainException(
                    ErrorCode.AADHAAR_VERIFICATION_FAILED,
                    USER_ERROR_MESSAGES.SIGNATURE_VERIFICATION_FAILED
                );
            }

            // 5. Extract verified demographic data from the PoI node
            const poiNode = doc.getElementsByTagName("Poi")[0] || doc.getElementsByTagNameNS("*", "Poi")[0];
            const referenceId = doc.documentElement?.getAttribute("referenceId") ||
                                doc.getElementsByTagName("OfflinePaperlessKyc")[0]?.getAttribute("referenceId");

            if (!poiNode) {
                throw new DomainException(ErrorCode.KYC_DOCUMENT_INVALID, USER_ERROR_MESSAGES.POI_NODE_MISSING);
            }

            if (!referenceId?.trim()) {
                throw new DomainException(ErrorCode.KYC_DOCUMENT_INVALID, USER_ERROR_MESSAGES.REFERENCE_ID_MISSING);
            }

            const legalName = poiNode.getAttribute("name");
            const rawDob = poiNode.getAttribute("dob");

            if (!legalName?.trim() || !rawDob?.trim()) {
                throw new DomainException(ErrorCode.KYC_DOCUMENT_INVALID, USER_ERROR_MESSAGES.NAME_OR_DOB_MISSING);
            }

            return {
                legalName: legalName.trim(),
                dateOfBirth: this._parseAadhaarDate(rawDob),
                documentNumber: referenceId.trim(),
            };

        } catch (error: unknown) {
            if (error instanceof DomainException) throw error;

            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorStack = error instanceof Error ? error.stack : undefined;
            this._logger.error(`Aadhaar XML processing failure: ${errorMessage}`, errorStack);
            throw new DomainException(ErrorCode.KYC_DOCUMENT_INVALID, USER_ERROR_MESSAGES.FAILED_TO_PROCESS_EKYC);
        }
    }
}