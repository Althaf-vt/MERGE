import { Inject, Injectable } from "@nestjs/common";
import { IGetAdminsUseCase } from "../interfaces/get-admins.use-case.interface";
import { ADMIN_REPOSITORY, IAdminRepository, PaginatedAdminsResult } from "../../domain/interfaces/admin-repository.interface";
import { GetAdminsDto } from "../dtos/get-admins.dto";
import { AdminAggregate } from "../../domain/entities/admin.entity";
import { PaginatedAdminsResponseDto } from "../dtos/admin-output.dto";
import { AdminDtoMapper } from "../../presentation/mappers/admin-dto.mapper";

@Injectable()
export class GetAdminsUseCase implements IGetAdminsUseCase{
    constructor(
        @Inject(ADMIN_REPOSITORY) private readonly _adminRepository: IAdminRepository,
    ){}

    async execute(filters: GetAdminsDto, currentAdminId: string): Promise<PaginatedAdminsResponseDto> {
        const result = await this._adminRepository.findAllPaginated({
            page: filters.page,
            limit: filters.limit,
            role: filters.role as any,
            status: filters.status as any,
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