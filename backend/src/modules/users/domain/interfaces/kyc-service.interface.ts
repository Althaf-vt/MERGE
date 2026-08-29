export const STORAGE_SERVICE = Symbol('STORAGE_SERVICE');
export const OCR_SERVICE = Symbol('OCR_SERVICE');
export const KYC_HASH_SERVICE = Symbol('KYC_HASH_SERVICE');

export interface IStorageService{
    // Generates a time-limited AWS URL for direct frontend uploads
    generatePresignedUploadUrl(userId: string, side: 'front' | 'back', mimeType: string): Promise<{uploadUrl: string, fileKey: string}>;
}

export interface IOcrResult{
    legalName: string;
    dateOfBirth: Date;
    documentNumber: string;
    confidenceScore: number;
}

export interface IOcrService{
    // Reads the doument directly from S3 using file key
    extractDocumentData(frontFileKey: string, backFileKey?: string): Promise<IOcrResult>;
}

export interface IKycHashService{
    // Specifically for generating deterministic hashes for Govt IDs
    hashDocumentNumber(documentNumber: string, country: string): string;
}
