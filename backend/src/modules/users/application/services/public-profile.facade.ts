import { Inject, Injectable } from "@nestjs/common";
import { IPublicProfileFacade, PublicProfileDto, PublicProfileSummaryDto } from "../interfaces/public-profile-facade.interface";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { PublicProfileFacadeMapper } from "../mappers/public-profile-facade.mapper";

@Injectable()
export class PublicProfileFacade implements IPublicProfileFacade {
    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository
    ) {}

    async isProfileInteractable(userId: string): Promise<boolean> {
        if (!userId) return false;
        const user = await this._userRepository.findById(userId);
        if (!user) return false;
        return user.isInteractable();
    }

    async getPublicProfile(userId: string): Promise<PublicProfileDto | null> {
        if (!userId) return null;
        const user = await this._userRepository.findById(userId);
        if (!user || !user.isInteractable()) return null;
        return PublicProfileFacadeMapper.toDto(user);
    }

    async getPublicProfiles(userIds: string[]): Promise<Map<string, PublicProfileSummaryDto>> {
        if (!userIds || userIds.length === 0) return new Map();

        const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));
        const users = await this._userRepository.findByIds(uniqueIds);

        return PublicProfileFacadeMapper.toSummaryDtoMap(users);
    }
}
