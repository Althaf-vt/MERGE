import { Inject, Injectable } from "@nestjs/common";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { UserFacadeMapper } from "../mappers/user-facade.mapper";
import { FacadeUserDto } from "../interfaces/user-management-facade.interface";
import { IGetAdminUserByIdUseCase } from "../interfaces/get-admin-user-by-id.use-case.interface";

@Injectable()
export class GetAdminUserByIdUseCase implements IGetAdminUserByIdUseCase {
    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
    ) {}

    async execute(userId: string): Promise<FacadeUserDto | null> {
        const user = await this._userRepository.findById(userId);
        if (!user) return null;
        return UserFacadeMapper.toDto(user);
    }
}
