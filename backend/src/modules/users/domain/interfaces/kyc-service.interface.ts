export const PKI_VERIFICATION_SERVICE = Symbol('PKI_VERIFICATION_SERVICE');
export const OCR_SERVICE = Symbol('OCR_SERVICE');
export const KYC_HASH_SERVICE = Symbol('KYC_HASH_SERVICE');

// Represent the pure demographic values extracted from digitally signed files
export interface IPkiResult{
    legalName: string;
    dateOfBirth: Date;
    documentNumber: string // will be the macked Id extracted from XML
}

export interface IPkiVerificationService{
    // Verifies the XML-DSig and extracts data using the provided share code
    verifyAadhaarXml(zipBuffer: Buffer, shareCode: string): Promise<IPkiResult>;
}

export interface IKycHashService{
    // Specifically for generating deterministic hashes for Govt IDs
    hashDocumentNumber(documentNumber: string, country: string): string;
}
