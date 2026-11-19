import { Inject, Injectable } from "@nestjs/common";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { USER_ERROR_MESSAGES } from "../../domain/constants/user-error-messages.constant";
import { IUnsuspendUserUseCase } from "../interfaces/unsuspend-user.use-case.interface";

@Injectable()
export class UnsuspendUserUseCase implements IUnsuspendUserUseCase {
    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
    ) {}

    async execute(userId: string): Promise<void> {
        const user = await this._userRepository.findById(userId);
        if (!user) throw new DomainException(ErrorCode.USER_NOT_FOUND, USER_ERROR_MESSAGES.TARGET_USER_NOT_FOUND);

        user.unsuspendAccount();
        await this._userRepository.update(user);
    }
}
