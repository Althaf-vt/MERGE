import { Inject, Injectable } from "@nestjs/common";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { HANDOFF_SERVICE, type IHandoffSessionService } from "../interfaces/handoff-service.interface";
import { IValidateHandoffUseCase } from "../interfaces/validate-handoff.interface.use-case";
import { HANDOFF_NOTIFICATION_SERVICE, IHandoffNotificationService } from "../interfaces/handoff-notification.service.interface";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { ITokenPayload, ITokenservice, TOKEN_SERVICE } from "../../../../shared/domain/interfaces/token-service.interface";
import { HandoffStatus, UserRole } from "../../domain/enums/user.enums";
import { USER_ERROR_MESSAGES } from "../../domain/constants/user-error-messages.constant";

@Injectable()
export class ValidateHandoffUseCase implements IValidateHandoffUseCase {
    constructor(
        @Inject(HANDOFF_SERVICE) private readonly _handoffService: IHandoffSessionService,
        @Inject(HANDOFF_NOTIFICATION_SERVICE) private readonly _handoffGateway: IHandoffNotificationService,
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
        @Inject(TOKEN_SERVICE) private readonly _tokenService: ITokenservice,
    ) { };

    async execute(sessionId: string): Promise<{ accessToken: string; refreshToken: string; userId: string }> {
        const userId = await this._handoffService.validateSession(sessionId);

        if (!userId) {
            throw new DomainException(ErrorCode.HANDOFF_SESSION_EXPIRED, USER_ERROR_MESSAGES.HANDOFF_SESSION_EXPIRED);
        }

        // Fetch user to build token payload
        const user = await this._userRepository.findById(userId);
        if (!user) {
            throw new DomainException(ErrorCode.USER_NOT_FOUND, USER_ERROR_MESSAGES.SESSION_USER_NOT_FOUND);
        }

        const tokenPayload: ITokenPayload = {
            userId: user.id as string,
            email: user.email.getValue(),
            role: UserRole.USER,
        };

        const accessToken = this._tokenService.generateAccessToken(tokenPayload);
        const refreshToken = this._tokenService.generateRefreshToken(tokenPayload);

        this._handoffGateway.notifyDesktop(sessionId, HandoffStatus.PHONE_CONNECTED);

        return { accessToken, refreshToken, userId };
    }
}