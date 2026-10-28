export const MEDIA_FACADE = 'MEDIA_FACADE';

export interface IMediaFacade {
    getPresignedMediaUrl(rawUrl: string, expiresInSeconds?: number): Promise<string | null>;
}