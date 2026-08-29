// export interface GetPresignedUrlDto{
//     mimeType: string;
// }

export interface SubmitKycPayload{
    documentType: string;
    issuingCountry: string;
    documentFrontKey: string;
    documentBackKey?: string;
}

export interface PresignedUrlResponse{
    uploadUrl: string;
    fileKey: string;
}