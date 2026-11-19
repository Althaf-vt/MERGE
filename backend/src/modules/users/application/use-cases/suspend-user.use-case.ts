import { Inject, Injectable } from "@nestjs/common";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { SuspensionDurationVO } from "../../domain/value-objects/suspension-duration.vo";
import { SuspensionUnit } from "../../domain/enums/user.enums";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { USER_ERROR_MESSAGES } from "../../domain/constants/user-error-messages.constant";
import { FacadeSuspensionUnit } from "../interfaces/user-management-facade.interface";
import { ISuspendUserUseCase } from "../interfaces/suspend-user.use-case.interface";

@Injectable()
export class SuspendUserUseCase implements ISuspendUserUseCase {
    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
    ) {}

    async execute(userId: string, duration: number, unit: FacadeSuspensionUnit, reason: string): Promise<void> {
        const user = await this._userRepository.findById(userId);
        if (!user) throw new DomainException(ErrorCode.USER_NOT_FOUND, USER_ERROR_MESSAGES.TARGET_USER_NOT_FOUND);

        const internalUnit = unit === 'HOURS' ? SuspensionUnit.HOURS : SuspensionUnit.DAYS;
        const durationVO = new SuspensionDurationVO(duration, internalUnit);

        user.suspendAccount(durationVO, reason);
        await this._userRepository.update(user);
    }
}
