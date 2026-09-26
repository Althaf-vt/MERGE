import { Inject, Injectable } from "@nestjs/common";
import { IUpdateFullProfileUseCase } from "../interfaces/update-full-profile.use-case.interface";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { UpdateFullProfileDto } from "../dtos/update-full-profile.dto";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { UserProfile } from "../../domain/entities/user-profile.entity";

@Injectable()
export class UpdateFullProfileUseCase implements IUpdateFullProfileUseCase {
    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository
    ) {}

    async execute(userId: string, payload: UpdateFullProfileDto): Promise<void> {
        const user = await this._userRepository.findById(userId);
        if (!user) throw new DomainException(ErrorCode.USER_NOT_FOUND, "User not found.");

        const profile = user.profile || new UserProfile({});
        
        profile.updateFullProfile(payload);
        
        user.attachProfile(profile);
        await this._userRepository.update(user);
    }
}