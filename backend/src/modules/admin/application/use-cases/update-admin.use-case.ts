import { Inject, Injectable } from '@nestjs/common';
import { IUpdateAdminUseCase } from '../interfaces/admin-management.use-case.interface';
import { ADMIN_REPOSITORY, IAdminRepository } from '../../domain/interfaces/admin-repository.interface';
import { UpdateAdminDto } from '../dtos/admin-management.dto';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { ErrorCode } from '../../../../shared/domain/enums/error-code.enum';

@Injectable()
export class UpdateAdminUseCase implements IUpdateAdminUseCase {
    constructor(
        @Inject(ADMIN_REPOSITORY) private readonly _adminRepository: IAdminRepository,
    ) {}
    
    async execute(targetAdminId: string, dto: UpdateAdminDto): Promise<void> {
        const admin = await this._adminRepository.findById(targetAdminId);

        if(!admin){
            throw new DomainException(ErrorCode.USER_NOT_FOUND, 'Admin account not found.');
        }

        if(dto.permissions){
            admin.assignPermissions(dto.permissions as any[]);
        }

        if(dto.role){
            admin.changeRole(dto.role as any);
        }

        await this._adminRepository.update(admin);
    }
}