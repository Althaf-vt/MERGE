import { Inject, Injectable } from "@nestjs/common";
import { IPublicProfileFacade, PublicProfileDto, PublicProfileSummaryDto } from "../interfaces/public-profile-facade.interface";
import { GET_PUBLIC_PROFILE_USE_CASE, IGetPublicProfileUseCase } from "../interfaces/get-public-profile.use-case.interface";

@Injectable()
export class PublicProfileFacade implements IPublicProfileFacade {
    constructor(
        @Inject(GET_PUBLIC_PROFILE_USE_CASE) private readonly _getPublicProfileUseCase: IGetPublicProfileUseCase,
    ) {}

    async isProfileInteractable(userId: string): Promise<boolean> {
        return this._getPublicProfileUseCase.isProfileInteractable(userId);
    }

    async getPublicProfile(userId: string): Promise<PublicProfileDto | null> {
        return this._getPublicProfileUseCase.getPublicProfile(userId);
    }

    async getPublicProfiles(userIds: string[]): Promise<Map<string, PublicProfileSummaryDto>> {
        return this._getPublicProfileUseCase.getPublicProfiles(userIds);
    }
}
