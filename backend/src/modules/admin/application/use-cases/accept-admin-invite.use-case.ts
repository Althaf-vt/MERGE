import { Inject, Injectable } from '@nestjs/common';
import { IAcceptAdminInviteUseCase } from '../interfaces/admin-management.use-case.interface';
import { ADMIN_REPOSITORY, IAdminRepository } from '../../domain/interfaces/admin-repository.interface';
import { ADMIN_INVITE_SERVICE, IAdminInviteService } from '../../domain/interfaces/admin-invite.interface';
import { IPasswordHasher, PASSWORD_HASHER } from '../../../../shared/domain/interfaces/password-hasher.interface';
import { AcceptAdminInviteDto } from '../dtos/admin-management.dto';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { ErrorCode } from '../../../../shared/domain/enums/error-code.enum';

@Injectable()
export class AcceptAdminInviteUseCase implements IAcceptAdminInviteUseCase {
    constructor(
        @Inject(ADMIN_REPOSITORY) private readonly _adminRepository: IAdminRepository,
        @Inject(ADMIN_INVITE_SERVICE) private readonly _inviteService: IAdminInviteService,
        @Inject(PASSWORD_HASHER) private readonly _passwordHasher: IPasswordHasher,
    ) {}

    async execute(dto: AcceptAdminInviteDto): Promise<void> {
        const normalizedEmail = await this._inviteService.verifyAndRetriveInvite(dto.token);

        if(!normalizedEmail){
            throw new DomainException(ErrorCode.TOKEN_INVALID, 'Invalid or expired invitation token.');
        }

        const admin = await this._adminRepository.findByEmail(normalizedEmail);

        if(!admin){
            throw new DomainException(ErrorCode.USER_NOT_FOUND, 'Invited admin account could not be found.');
        }

        const hashedPassword = await this._passwordHasher.hash(dto.password);

        admin.acceptInvitation(hashedPassword);
        
        await this._adminRepository.update(admin);

        await this._inviteService.deleteInviteToken(dto.token);
    }
}