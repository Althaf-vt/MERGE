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
    front: {uploadUrl: string, fileKey: string};
    back: {uploadUrl: string, fileKey: string};
}