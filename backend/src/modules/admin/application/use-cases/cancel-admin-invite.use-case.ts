import { Inject, Injectable } from "@nestjs/common";
import { ICancelAdminInviteUseCase } from "../interfaces/admin-invitation-lifecycle.use-case.interface";
import { ADMIN_REPOSITORY, IAdminRepository } from "../../domain/interfaces/admin-repository.interface";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { ADMIN_ERROR_MESSAGES } from "../../domain/constants/admin-error-messages.constant";

@Injectable()
export class CancelAdminInviteUseCase implements ICancelAdminInviteUseCase {
    constructor(
        @Inject(ADMIN_REPOSITORY) private readonly _adminRepository: IAdminRepository,
    ) { }

    async execute(targetAdminId: string): Promise<void> {
        const admin = await this._adminRepository.findById(targetAdminId);

        if (!admin) {
            throw new DomainException(ErrorCode.USER_NOT_FOUND, ADMIN_ERROR_MESSAGES.ADMIN_NOT_FOUND);
        }

        admin.validateCanCancelInvitation();

        await this._adminRepository.delete(admin.id as string);
    }
}