import { Inject, Injectable } from "@nestjs/common";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { IDeactivateAccountUseCase } from "../interfaces/security-management.use-case.interface";
import { IUserSessionService, USER_SESSION_SERVICE } from "../../domain/interfaces/user-session.interface";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";

@Injectable()
export class DeactivateAccountUseCase implements IDeactivateAccountUseCase {
    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
        @Inject(USER_SESSION_SERVICE) private readonly _sessionService: IUserSessionService,
    ) {}

    async execute(userId: string): Promise<void> {
        const user = await this._userRepository.findById(userId);
        if (!user) throw new DomainException(ErrorCode.USER_NOT_FOUND, 'User not found.');

        user.deactivateAccount();
        await this._userRepository.update(user);

        // Instantly terminate all active sessions to enforce the deactivation state
        await this._sessionService.revokeAllSessions(userId);
    }
}