import { Inject, Injectable } from "@nestjs/common";
import { IMediaFacade } from "../interfaces/media-facade.interface";
import { IStorageService, STORAGE_SERVICE } from "../interfaces/storage-service.interface";

@Injectable()
export class MediaFacade implements IMediaFacade {
    constructor(
        @Inject(STORAGE_SERVICE) private readonly _storageService: IStorageService
    ) {}

    async getPresignedMediaUrl(rawUrl: string, expiresInSeconds?: number): Promise<string | null> {
        if (!rawUrl) return null;
        try {
            return await this._storageService.getPresignedUrl(rawUrl, expiresInSeconds);
        } catch (error: unknown) {
            return null;
        }
    }
}