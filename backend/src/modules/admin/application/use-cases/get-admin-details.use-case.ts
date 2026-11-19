import { Inject, Injectable } from "@nestjs/common";
import { ADMIN_REPOSITORY, IAdminRepository } from "../../domain/interfaces/admin-repository.interface";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { AdminDtoMapper } from "../mappers/admin-dto.mapper";
import { IGetAdminDetailsUseCase } from "../interfaces/admin-personnel.use-case.interface";
import { AdminDetailsDto } from "../dtos/admin-output.dto";
import { ADMIN_ERROR_MESSAGES } from "../../domain/constants/admin-error-messages.constant";

@Injectable()
export class GetAdminDetailsUseCase implements IGetAdminDetailsUseCase {
    constructor(
        @Inject(ADMIN_REPOSITORY) private readonly _adminRepository: IAdminRepository,
    ) { }

    async execute(targetAdminId: string): Promise<AdminDetailsDto> {
        const admin = await this._adminRepository.findById(targetAdminId);
        if (!admin) {
            throw new DomainException(ErrorCode.USER_NOT_FOUND, ADMIN_ERROR_MESSAGES.ADMIN_PERSONNEL_NOT_FOUND);
        }
        return AdminDtoMapper.toDetailsDto(admin);
    }
}