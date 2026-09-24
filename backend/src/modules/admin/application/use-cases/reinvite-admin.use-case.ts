import { Inject, Injectable } from "@nestjs/common";
import * as crypto from 'crypto';
import { IReinviteAdminUseCase } from "../interfaces/admin-invitation-lifecycle.use-case.interface";
import { ADMIN_REPOSITORY, IAdminRepository } from "../../domain/interfaces/admin-repository.interface";
import { ADMIN_INVITE_SERVICE, IAdminInviteService } from "../../domain/interfaces/admin-invite.interface";
import { EMAIL_SERVICE, IEmailService } from "../../../../shared/domain/interfaces/email-service.interface";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";

@Injectable()
export class ReinviteAdminUseCase implements IReinviteAdminUseCase {
    constructor(
        @Inject(ADMIN_REPOSITORY) private readonly _adminRepository: IAdminRepository,
        @Inject(ADMIN_INVITE_SERVICE) private readonly _inviteService: IAdminInviteService,
        @Inject(EMAIL_SERVICE) private readonly _emailService: IEmailService,
    ) { }

    async execute(targetAdminId: string, inviterName: string): Promise<void> {
        const admin = await this._adminRepository.findById(targetAdminId);
        if (!admin) throw new DomainException(ErrorCode.USER_NOT_FOUND, 'Admin account not found.');

        const ttlSeconds = parseInt(process.env.ADMIN_INVITE_TTL_SECONDS || '86400');
        const newExpiryDate = new Date(Date.now() + (ttlSeconds * 1000));

        admin.renewInvitation(newExpiryDate);

        const token = crypto.randomBytes(32).toString('hex');
        await this._inviteService.storeInviteToken(admin.email, token, ttlSeconds);

        await this._emailService.sendAdminInviteEmail(admin.email.getValue(), token, inviterName);

        await this._adminRepository.update(admin);
    }
}