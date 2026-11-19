import { Inject, Injectable } from '@nestjs/common';
import { ADMIN_REPOSITORY, IAdminRepository } from '../../domain/interfaces/admin-repository.interface';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { ErrorCode } from '../../../../shared/domain/enums/error-code.enum';
import { IDeactivateAdminUseCase } from '../interfaces/admin-status.use-case.interface';
import { ADMIN_ERROR_MESSAGES } from '../../domain/constants/admin-error-messages.constant';

@Injectable()
export class DeactivateAdminUseCase implements IDeactivateAdminUseCase {
    constructor(
        @Inject(ADMIN_REPOSITORY) private readonly _adminRepository: IAdminRepository
    ) {}

    async execute(targetAdminId: string, reason: string, actionByAdminId: string): Promise<void> {
        const admin = await this._adminRepository.findById(targetAdminId);
        
        if (!admin) {
            throw new DomainException(ErrorCode.USER_NOT_FOUND, ADMIN_ERROR_MESSAGES.ADMIN_NOT_FOUND);
        }

        admin.deactivateAccount(reason, actionByAdminId);
        
        await this._adminRepository.update(admin);
    }
}