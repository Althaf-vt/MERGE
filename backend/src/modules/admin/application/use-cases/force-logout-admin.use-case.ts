import { Inject, Injectable } from "@nestjs/common";
import { ADMIN_REPOSITORY, IAdminRepository } from "../../domain/interfaces/admin-repository.interface";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { IForceLogoutAdminUseCase } from "../interfaces/admin-personnel.use-case.interface";
import { ADMIN_SESSION_SERVICE, IAdminSessionService } from "../../domain/interfaces/admin-session.interface";
import { AdminRole } from "../../domain/enums/admin.enums";

@Injectable()
export class ForceLogoutAdminUseCase implements IForceLogoutAdminUseCase {
    constructor(
        @Inject(ADMIN_REPOSITORY) private readonly _adminRepository: IAdminRepository,
        @Inject(ADMIN_SESSION_SERVICE) private readonly _sessionService: IAdminSessionService,
    ) { }

    async execute(targetAdminId: string): Promise<void> {
        const admin = await this._adminRepository.findById(targetAdminId);
        if (!admin) {
            throw new DomainException(ErrorCode.USER_NOT_FOUND, 'Admin personnel not found.');
        }

        if (admin.role === AdminRole.SUPER_ADMIN) {
            throw new DomainException(ErrorCode.FORBIDDEN, 'Super Admins cannot be forcefully logged out.')
        }

        await this._sessionService.deleteSession(targetAdminId);
    }
}