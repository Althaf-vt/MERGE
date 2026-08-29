import { Inject, Injectable } from "@nestjs/common";
import { type IStorageService, STORAGE_SERVICE } from "../../domain/interfaces/kyc-service.interface";

@Injectable()
export class GetPresignedUrlUseCase{
    constructor(
        @Inject(STORAGE_SERVICE) private readonly storageService: IStorageService,
    ){}

    async execute(userId: string, mimeType: string){
        const front = await this.storageService.generatePresignedUploadUrl(userId, 'front', mimeType);
        const back = await this.storageService.generatePresignedUploadUrl(userId, 'back', mimeType);

        return {front, back}
    }
}