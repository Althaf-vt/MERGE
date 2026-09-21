import { Inject, Injectable, Logger } from "@nestjs/common";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { EMAIL_SERVICE, IEmailService } from "../../domain/interfaces/email-service.interface";
import { OnEvent } from "@nestjs/event-emitter";
import { UserSupendedDomainEvent } from "../../domain/events/user-suspended.domain-event";

@Injectable()
export class UserSuspendedListener{
    private readonly _logger = new Logger(UserSuspendedListener.name);

    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
        @Inject(EMAIL_SERVICE) private readonly _emailService: IEmailService,
    ){}

    @OnEvent('user.suspended', {async: true})
    async handle(event: UserSupendedDomainEvent): Promise<void>{
        this._logger.log(`Reacting to suspension event for user ${event.userId}`);

        const user = await this._userRepository.findById(event.userId);
        if (!user) {
            this._logger.warn(`User ${event.userId} not found during suspension event handling`);
            return;
        }

        const email = user.email.getValue();
        await this._emailService.sendSuspensionNotificationEmail(email, event.reason, event.suspendedUntil);
    }
}