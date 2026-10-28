import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { IPkiResult, IPkiVerificationService } from "../../domain/interfaces/kyc-service.interface";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { EnvConfig } from "../../../../shared/infrastructure/config/env.config";
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
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this._logger.error(`Failed to parse UIDAI root certificate: ${message}`);
        }
    }

    private _parseAadhaarDate(dobStr: string): Date {
        if (!dobStr) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, "Date of Birth attribute is missing in e-KYC XML.");
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

        throw new DomainException(ErrorCode.VALIDATION_FAILED, `Unrecognized Date of Birth format: ${dobStr}`);
    }

    private _createValidatedDate(year: number, month: number, day: number, rawInput: string): Date {
        if (month < 1 || month > 12 || day < 1 || day > 31) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, `Invalid calendar date components in DOB: ${rawInput}`);
        }

        const date = new Date(Date.UTC(year, month - 1, day));
        if (
            date.getUTCFullYear() !== year ||
            date.getUTCMonth() !== month - 1 ||
            date.getUTCDate() !== day
        ) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, `Invalid calendar date rollover in DOB: ${rawInput}`);
        }

        if (date.getTime() > Date.now()) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, "Date of Birth cannot be in the future.");
        }

        return date;
    }

    private _resolveSigningKey(doc: XmlDocument): string {
        if (!this._trustedRootCert) {
            this._loadRootCertificate();
            if (!this._trustedRootCert) {
                throw new DomainException(
                    ErrorCode.INTERNAL_SERVER_ERROR,
                    'Root verification certificate is unavailable on the server.'
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
            throw new DomainException(ErrorCode.KYC_DOCUMENT_INVALID, 'Embedded X.509 certificate in XML is malformed.');
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
                'XML certificate is untrusted or was not issued by the UIDAI certifying authority.'
            );
        }

        // Validate certificate validity window
        const now = Date.now();
        const validFrom = new Date(embeddedCert.validFrom).getTime();
        const validTo = new Date(embeddedCert.validTo).getTime();

        if (now < validFrom || now > validTo) {
            throw new DomainException(
                ErrorCode.AADHAAR_VERIFICATION_FAILED,
                'The digital certificate used to sign this Aadhaar XML has expired or is not yet valid.'
            );
        }

        return embeddedPem;
    }

    async verifyAadhaarXml(zipBuffer: Buffer, shareCode: string): Promise<IPkiResult> {
        try {
            if (!zipBuffer || zipBuffer.length === 0) {
                throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Zip buffer is empty or invalid.');
            }

            const cleanShareCode = shareCode?.trim();
            if (!cleanShareCode || !/^\d{4}$/.test(cleanShareCode)) {
                throw new DomainException(ErrorCode.VALIDATION_FAILED, 'A valid 4-digit numeric share code is required.');
            }

            // 1. Unzip the password-protected file
            let zip: AdmZip;
            try {
                zip = new AdmZip(zipBuffer);
            } catch {
                throw new DomainException(ErrorCode.KYC_DOCUMENT_INVALID, 'Uploaded file is not a valid ZIP archive.');
            }

            const zipEntries = zip.getEntries();
            const xmlEntry = zipEntries.find(entry => !entry.isDirectory && entry.entryName.toLowerCase().endsWith('.xml'));

            if (!xmlEntry) {
                throw new DomainException(ErrorCode.KYC_DOCUMENT_INVALID, 'No valid XML document found inside the ZIP archive.');
            }

            // 2. Extract raw XML using 4-digit share code
            let xmlBuffer: Buffer;
            try {
                xmlBuffer = xmlEntry.getData(cleanShareCode);
            } catch {
                throw new DomainException(ErrorCode.KYC_DOCUMENT_INVALID, "Invalid share code or failed to decrypt ZIP file.");
            }

            if (!xmlBuffer || xmlBuffer.length === 0) {
                throw new DomainException(ErrorCode.KYC_DOCUMENT_INVALID, "Invalid share code or failed to decrypt XML content.");
            }

            const xmlString = xmlBuffer.toString('utf-8');

            // 3. Parse XML DOM
            const doc = new DOMParser({
                errorHandler: (level: 'warning' | 'error' | 'fatalError', msg: string) => {
                    if (level === 'error' || level === 'fatalError') {
                        throw new DomainException(ErrorCode.KYC_DOCUMENT_INVALID, `XML Parsing Error: ${msg}`);
                    }
                }
            }).parseFromString(xmlString, 'text/xml');

            // 4. Resolve signing key and verify digital signature
            const signature = doc.getElementsByTagNameNS("http://www.w3.org/2000/09/xmldsig#", "Signature")[0] ||
                              doc.getElementsByTagName("ds:Signature")[0] ||
                              doc.getElementsByTagName("Signature")[0];

            if (!signature) {
                throw new DomainException(ErrorCode.KYC_DOCUMENT_INVALID, 'Digital signature missing from XML.');
            }

            const signingKeyPem = this._resolveSigningKey(doc);
            const sig = new SignedXml({ publicCert: signingKeyPem });
            sig.loadSignature(signature.toString());

            const isValid = sig.checkSignature(xmlString);
            if (!isValid) {
                this._logger.warn('Digital signature cryptographic verification failed on Aadhaar XML.');
                throw new DomainException(
                    ErrorCode.AADHAAR_VERIFICATION_FAILED,
                    'Cryptographic signature verification failed. Document may have been modified or tampered with.'
                );
            }

            // 5. Extract verified demographic data from the PoI node
            const poiNode = doc.getElementsByTagName("Poi")[0] || doc.getElementsByTagNameNS("*", "Poi")[0];
            const referenceId = doc.documentElement?.getAttribute("referenceId") ||
                                doc.getElementsByTagName("OfflinePaperlessKyc")[0]?.getAttribute("referenceId");

            if (!poiNode) {
                throw new DomainException(ErrorCode.KYC_DOCUMENT_INVALID, 'Proof of Identity (Poi) node missing in verified XML.');
            }

            if (!referenceId?.trim()) {
                throw new DomainException(ErrorCode.KYC_DOCUMENT_INVALID, 'Mandatory referenceId attribute missing from verified XML.');
            }

            const legalName = poiNode.getAttribute("name");
            const rawDob = poiNode.getAttribute("dob");

            if (!legalName?.trim() || !rawDob?.trim()) {
                throw new DomainException(ErrorCode.KYC_DOCUMENT_INVALID, "Name or DOB attribute is missing in identity node.");
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
            throw new DomainException(ErrorCode.KYC_DOCUMENT_INVALID, "Failed to process Offline e-KYC document.");
        }
    }
}