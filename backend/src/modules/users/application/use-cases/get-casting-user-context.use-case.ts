import { Inject, Injectable } from "@nestjs/common";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { CastingUserContextDto } from "../dtos/casting-user-context.dto";
import { CastingUserDtoMapper } from "../mappers/casting-user-dto.mapper";
import { IGetCastingUserContextUseCase } from "../interfaces/get-casting-user-context.use-case.interface";

@Injectable()
export class GetCastingUserContextUseCase implements IGetCastingUserContextUseCase {
    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
    ) {}

    async execute(userId: string): Promise<CastingUserContextDto | null> {
        const user = await this._userRepository.findById(userId);
        if (!user) return null;
        return CastingUserDtoMapper.toContextDto(user);
    }
}
