import { Inject, Injectable } from "@nestjs/common";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { UserStatus } from "../../domain/enums/user.enums";
import { UserFacadeMapper } from "../mappers/user-facade.mapper";
import { GetUsersFilters, PaginatedUsersResult } from "../interfaces/user-management-facade.interface";
import { IGetAdminUsersUseCase } from "../interfaces/get-admin-users.use-case.interface";

@Injectable()
export class GetAdminUsersUseCase implements IGetAdminUsersUseCase {
    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
    ) {}

    async execute(filters: GetUsersFilters): Promise<PaginatedUsersResult> {
        const internalFilters = {
            ...filters,
            status: filters.status as UserStatus,
        };

        const result = await this._userRepository.findAllPaginated(internalFilters);
        return UserFacadeMapper.toPaginatedResponseDto(result);
    }
}
