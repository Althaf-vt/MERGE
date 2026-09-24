import { Inject, Injectable } from "@nestjs/common";
import { IReactivateAdminUseCase } from "../interfaces/admin-status.use-case.interface";
import { ADMIN_REPOSITORY, IAdminRepository } from "../../domain/interfaces/admin-repository.interface";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";

@Injectable()
export class ReactivateAdminUseCase implements IReactivateAdminUseCase{
    constructor(@Inject(ADMIN_REPOSITORY) private readonly _adminRepository: IAdminRepository){}

    async execute(targetAdminId: string): Promise<void> {
        const admin = await this._adminRepository.findByEmail(targetAdminId);

        if(!admin) throw new DomainException(ErrorCode.USER_NOT_FOUND, 'Admin account not found.');

        admin.reactivateAccount();
        await this._adminRepository.update(admin);
    }
}