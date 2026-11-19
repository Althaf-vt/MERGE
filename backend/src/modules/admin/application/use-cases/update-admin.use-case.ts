import { Inject, Injectable } from '@nestjs/common';
import { IUpdateAdminUseCase } from '../interfaces/admin-management.use-case.interface';
import { ADMIN_REPOSITORY, IAdminRepository } from '../../domain/interfaces/admin-repository.interface';
import { UpdateAdminDto } from '../dtos/admin-management.dto';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { ErrorCode } from '../../../../shared/domain/enums/error-code.enum';
import { AdminPermission } from '../../domain/enums/admin-permission.enums';
import { AdminRole } from '../../../../shared/domain/enums/admin-rbac.enums';
import { ADMIN_ERROR_MESSAGES } from '../../domain/constants/admin-error-messages.constant';

@Injectable()
export class UpdateAdminUseCase implements IUpdateAdminUseCase {
    constructor(
        @Inject(ADMIN_REPOSITORY) private readonly _adminRepository: IAdminRepository,
    ) {}
    
    async execute(targetAdminId: string, dto: UpdateAdminDto): Promise<void> {
        const admin = await this._adminRepository.findById(targetAdminId);

        if(!admin){
            throw new DomainException(ErrorCode.USER_NOT_FOUND, ADMIN_ERROR_MESSAGES.ADMIN_NOT_FOUND);
        }

        if(dto.permissions){
            admin.assignPermissions(dto.permissions as AdminPermission[]);
        }

        if(dto.role){
            admin.changeRole(dto.role as AdminRole);
        }

        await this._adminRepository.update(admin);
    }
}