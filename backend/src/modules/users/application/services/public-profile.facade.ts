import { Inject, Injectable } from "@nestjs/common";
import { IPublicProfileFacade, PublicProfileDto } from "../interfaces/public-profile-facade.interface";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { PublicProfileFacadeMapper } from "../mappers/public-profile-facade.mapper";

@Injectable()
export class PublicProfileFacade implements IPublicProfileFacade {
    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository
    ) {}

    async getPublicProfile(userId: string): Promise<PublicProfileDto | null> {
        const user = await this._userRepository.findById(userId);
        if (!user) return null;
        return PublicProfileFacadeMapper.toDto(user);
    }
}