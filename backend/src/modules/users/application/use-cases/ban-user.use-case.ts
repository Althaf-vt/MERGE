import { Inject, Injectable } from "@nestjs/common";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { USER_ERROR_MESSAGES } from "../../domain/constants/user-error-messages.constant";
import { IBanUserUseCase } from "../interfaces/ban-user.use-case.interface";

@Injectable()
export class BanUserUseCase implements IBanUserUseCase {
    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
    ) {}

    async execute(userId: string, reason: string): Promise<void> {
        const user = await this._userRepository.findById(userId);
        if (!user) throw new DomainException(ErrorCode.USER_NOT_FOUND, USER_ERROR_MESSAGES.TARGET_USER_NOT_FOUND);

        user.banAccount(reason);
        await this._userRepository.update(user);
    }
}
