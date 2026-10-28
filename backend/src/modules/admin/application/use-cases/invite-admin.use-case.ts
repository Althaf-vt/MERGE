import { Inject, Injectable } from "@nestjs/common";
import * as crypto from 'crypto';
import { ADMIN_REPOSITORY, IAdminRepository } from "../../domain/interfaces/admin-repository.interface";
import { ADMIN_INVITE_SERVICE, IAdminInviteService } from "../../domain/interfaces/admin-invite.interface";
import { EMAIL_SERVICE, IEmailService } from "../../../../shared/domain/interfaces/email-service.interface";
import { IInviteAdminUseCase } from "../interfaces/admin-management.use-case.interface";
import { InviteAdminDto } from "../dtos/admin-management.dto";
import { EmailVO } from "../../../../shared/domain/value-objects/email.vo";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { AdminAggregate } from "../../domain/entities/admin.entity";
import { AdminRole, AdminStatus } from "../../domain/enums/admin.enums";
import { AdminPermission } from "../../domain/enums/admin-permission.enums";
import { EnvConfig } from "../../../../shared/infrastructure/config/env.config";

@Injectable()
export class InviteAdminUseCase implements IInviteAdminUseCase {
    constructor(
        @Inject(ADMIN_REPOSITORY) private readonly _adminRepository: IAdminRepository,
        @Inject(ADMIN_INVITE_SERVICE) private readonly _inviteService: IAdminInviteService,
        @Inject(EMAIL_SERVICE) private readonly _emailService: IEmailService,
    ) {}

    async execute(dto: InviteAdminDto, inviterId: string, inviterEmail?: string): Promise<void> {
        const emailVo = new EmailVO(dto.email);
        const existingAdmin = await this._adminRepository.findByEmail(emailVo.getValue());

        if(existingAdmin){
            throw new DomainException(ErrorCode.USER_ALREADY_EXISTS, 'An admin account with this email already exists.');
        }

        const ttlSeconds = EnvConfig.admin.inviteTtlSeconds;
        const expiresAt = new Date(Date.now() + (ttlSeconds * 1000));

        const newAdmin = new AdminAggregate({
            email: emailVo,
            fullName: dto.fullName,
            role: dto.role as AdminRole,
            status: AdminStatus.INVITED,
            permissions: (dto.permissions as AdminPermission[]) ?? [],
            passwordHash: null,
            inviteExpiresAt: expiresAt,
            createdBy: inviterId,
        });

        await this._adminRepository.create(newAdmin);
        
        const token = crypto.randomBytes(32).toString('hex');        
        await this._inviteService.storeInviteToken(emailVo, token, ttlSeconds);
        const senderDisplayName = inviterEmail || 'Super Admin';
        await this._emailService.sendAdminInviteEmail(emailVo.getValue(), token, senderDisplayName);
    }
}