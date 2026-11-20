export const CREATE_KYC_ESCALATION_TASK_USE_CASE = 'CREATE_KYC_ESCALATION_TASK_USE_CASE';

export interface ICreateKycEscalationTaskUseCase {
    execute(
        targetUserId: string,
        documentType: string,
        issuingCountry: string,
        kycSelfieUrl: string,
        uploadedDocumentUrl: string,
        livenessScore: number,
        faceMatchScore: number
    ): Promise<void>;
}
