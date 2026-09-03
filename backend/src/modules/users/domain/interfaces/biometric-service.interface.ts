export const BIOMETRIC_SERVICE = Symbol('BIOMETRIC_SERVICE');

export interface IExtractionResult {
    confidence: number;
    faceEmbedding: number[]; // the 512-dimentional Identity vector
}

export interface IBiometricService{
    // Analyzes an image buffer for physical liveness and extracts facial embeddings.
    extractEmbedding(imageBuffer: Buffer): Promise<IExtractionResult>;
}