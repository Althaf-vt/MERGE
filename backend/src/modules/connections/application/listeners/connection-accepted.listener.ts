import { Inject, Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { IPrivateListRepository, PRIVATE_LIST_REPOSITORY } from "../../domain/interfaces/private-list-repository.interface";
import { ConnectionAcceptedDomainEvent } from "../../domain/events/connection-accepted.domain-event";
import { CONNECTION_DOMAIN_EVENTS } from "../../domain/constants/connection.constants";

@Injectable()
export class ConnectionAcceptedListener {
    private readonly _logger = new Logger(ConnectionAcceptedListener.name);

    constructor(
        @Inject(PRIVATE_LIST_REPOSITORY) private readonly _privateListRepo: IPrivateListRepository,
    ) {}

    @OnEvent(CONNECTION_DOMAIN_EVENTS.ACCEPTED, { async: true })
    async handle(event: ConnectionAcceptedDomainEvent): Promise<void> {
        this._logger.log(
            `Connection ${event.connectionId} accepted: removing users ${event.requesterId} and ${event.recipientId} from each other's private lists`
        );

        await Promise.all([
            this._privateListRepo.deleteExact(event.requesterId, event.recipientId),
            this._privateListRepo.deleteExact(event.recipientId, event.requesterId),
        ]);
    }
}

