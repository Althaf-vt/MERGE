import { SubmitKycDto } from "../dtos/submit-kyc.dto";

export const SUBMIT_KYC_DOCUMENT_USE_CASE = Symbol('SUBMIT_KYC_DOCUMENT_USE_CASE');

export interface SubmitKycPayload extends SubmitKycDto {
    fileBuffer: Buffer;
}

export interface SubmitKycDocumentResult {
    message: string;
    extractedData: {
        legalName: string,
        dateOfBirth: Date,
    }
}

export interface ISubmitKycDocumentUseCase {
    execute(userId: string, payload: SubmitKycPayload): Promise<SubmitKycDocumentResult>;
}