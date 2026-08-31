export const DocumentType = {
    AADHAAR_XML : 'AADHAAR_XML',
    EPAN_PDF : 'EPAN_PDF',
    DIGILOCKER_DL : 'DIGILOCKER_DL',
    PASSPORT : 'PASSPORT'
} as const

export type DocumentType = typeof DocumentType[keyof typeof DocumentType]

export interface SubmitKycPayload{
    documentType: DocumentType;
    issuingCountry: string;
    sharedCode?: string // Required for password-protected formats like Aadhaar XML
}