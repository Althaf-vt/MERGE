import { Inject, Injectable } from "@nestjs/common";
import { IGetAdminsUseCase } from "../interfaces/get-admins.use-case.interface";
import { ADMIN_REPOSITORY, IAdminRepository } from "../../domain/interfaces/admin-repository.interface";
import { GetAdminsDto } from "../dtos/get-admins.dto";
import { PaginatedAdminsResponseDto } from "../dtos/admin-output.dto";
import { AdminDtoMapper } from "../mappers/admin-dto.mapper";
import { AdminRole, AdminStatus } from "../../domain/enums/admin.enums";

@Injectable()
export class GetAdminsUseCase implements IGetAdminsUseCase {
    constructor(
        @Inject(ADMIN_REPOSITORY) private readonly _adminRepository: IAdminRepository,
    ) { }

    async execute(filters: GetAdminsDto, currentAdminId: string): Promise<PaginatedAdminsResponseDto> {
        const result = await this._adminRepository.findAllPaginated({
            page: filters.page,
            limit: filters.limit,
            role: filters.role as AdminRole | undefined,
            status: filters.status as AdminStatus | undefined,
            search: filters.search,
            excludeAdminId: currentAdminId,
        });

        return {
            data: result.data.map(admin => AdminDtoMapper.toDetailsDto(admin)),
            total: result.total,
            page: result.page,
            limit: result.limit
        };
    }
}