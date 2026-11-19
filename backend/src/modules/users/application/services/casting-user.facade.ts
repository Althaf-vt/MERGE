import { Inject, Injectable } from "@nestjs/common";
import { IcastingUserFacade } from "../interfaces/casting-user-facade.interface";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { CastingUserContextDto } from "../dtos/casting-user-context.dto";
import { CastingUserDtoMapper } from "../mappers/casting-user-dto.mapper";
import { IMarkCastingCompleteUseCase, MARK_CASTING_COMPLETE_USE_CASE } from "../interfaces/mark-casting-complete.use-case.interface";

@Injectable()
export class CastingUserFacade implements IcastingUserFacade {
    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
        @Inject(MARK_CASTING_COMPLETE_USE_CASE) private readonly _markCastingCompleteUseCase: IMarkCastingCompleteUseCase,
    ) {}

    async getUserContextForCasting(userId: string): Promise<CastingUserContextDto | null> {
        const user = await this._userRepository.findById(userId);
        if (!user) return null;
        return CastingUserDtoMapper.toContextDto(user);
    }

    async markCastingComplete(userId: string, personalityVector: number[]): Promise<void> {
        return this._markCastingCompleteUseCase.execute(userId, personalityVector);
    }
}