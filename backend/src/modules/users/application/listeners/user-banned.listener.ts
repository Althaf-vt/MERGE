import { Inject, Injectable, Logger } from "@nestjs/common";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { EMAIL_SERVICE, IEmailService } from "../../domain/interfaces/email-service.interface";
import { OnEvent } from "@nestjs/event-emitter";
import { UserBannedDomainEvent } from "../../domain/events/user-banned.domain-event";

@Injectable()
export class UserBannedListener{
    private readonly _logger = new Logger(UserBannedListener.name);

    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
        @Inject(EMAIL_SERVICE) private readonly _emailService: IEmailService,
    ){}

    // {async: true} ensures the original request doesnt hang waiting for the email to send
    @OnEvent('user.banned', {async: true})
    async handle(event: UserBannedDomainEvent): Promise<void>{
        this._logger.log(`Reacting to ban event for user ${event.userId}`);

        const user = await this._userRepository.findById(event.userId);
        if(!user){
            this._logger.warn(`User ${event.userId} not found during ban event handling`);
            return;
        }
        
        const email = user.email.getValue();
        await this._emailService.sendBanNotificationEmail(email, event.reason);
    }
}