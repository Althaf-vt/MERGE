export const STORAGE_SERVICE = 'STORAGE_SERVICE';

export interface IStorageService {
    uploadSelfie(userId: string, fileBuffer: Buffer, mimeType?: string): Promise<string>;
    uploadVideo(userId: string, fileBuffer: Buffer, mimeType?: string): Promise<string>;
}