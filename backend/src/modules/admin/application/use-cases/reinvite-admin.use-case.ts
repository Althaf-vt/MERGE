import { Inject, Injectable } from "@nestjs/common";
import * as crypto from 'crypto';
import { IReinviteAdminUseCase } from "../interfaces/admin-invitation-lifecycle.use-case.interface";
import { ADMIN_REPOSITORY, IAdminRepository } from "../../domain/interfaces/admin-repository.interface";
import { ADMIN_INVITE_SERVICE, IAdminInviteService } from "../../domain/interfaces/admin-invite.interface";
import { EMAIL_SERVICE, IEmailService } from "../../../../shared/domain/interfaces/email-service.interface";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { ADMIN_ERROR_MESSAGES } from "../../domain/constants/admin-error-messages.constant";
import { ADMIN_POLICY } from "../../domain/constants/admin.constants";
import { ADMIN_APP_CONFIG, IAdminAppConfig } from "../interfaces/admin-app-config.interface";

@Injectable()
export class ReinviteAdminUseCase implements IReinviteAdminUseCase {
    constructor(
        @Inject(ADMIN_REPOSITORY) private readonly _adminRepository: IAdminRepository,
        @Inject(ADMIN_INVITE_SERVICE) private readonly _inviteService: IAdminInviteService,
        @Inject(EMAIL_SERVICE) private readonly _emailService: IEmailService,
        @Inject(ADMIN_APP_CONFIG) private readonly _config: IAdminAppConfig,
    ) { }

    async execute(targetAdminId: string, inviterEmail?: string): Promise<void> {
        const admin = await this._adminRepository.findById(targetAdminId);
        if (!admin) throw new DomainException(ErrorCode.USER_NOT_FOUND, ADMIN_ERROR_MESSAGES.ADMIN_NOT_FOUND);

        const ttlSeconds = this._config.inviteTtlSeconds;
        const newExpiryDate = new Date(Date.now() + (ttlSeconds * 1000));

        admin.renewInvitation(newExpiryDate);

        const token = crypto.randomBytes(ADMIN_POLICY.INVITE_TOKEN_BYTE_LENGTH).toString('hex');
        await this._inviteService.storeInviteToken(admin.email, token, ttlSeconds);

        const senderDisplayName = inviterEmail || 'Super Admin';
        await this._emailService.sendAdminInviteEmail(admin.email.getValue(), token, senderDisplayName);

        await this._adminRepository.update(admin);
    }
}