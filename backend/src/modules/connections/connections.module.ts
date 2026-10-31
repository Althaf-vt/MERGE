import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UserModule } from "../users/users.module";
import { CONNECTION_REPOSITORY } from "./domain/interfaces/connection-repository.interface";
import { PRIVATE_LIST_REPOSITORY } from "./domain/interfaces/private-list-repository.interface";
import { ConnectionsController } from "./presentation/controllers/connections.controller";
import { PrivateListsController } from "./presentation/controllers/private-lists.controller";
import { BILLING_FACADE } from "./application/interfaces/billing-facade.interface";
import { SendConnectionRequestUseCase } from "./application/use-cases/send-connection-request.use-case";
import { SendPriorityIntroUseCase } from "./application/use-cases/send-priority-intro.use-case";
import { AcceptConnectionUseCase } from "./application/use-cases/accept-connection.use-case";
import { DeclineConnectionUseCase } from "./application/use-cases/decline-connection.use-case";
import { CancelConnectionUseCase } from "./application/use-cases/cancel-connection.use-case";
import { RevokeMatchUseCase } from "./application/use-cases/revoke-match.use-case";
import { AddToPrivateListUseCase } from "./application/use-cases/add-to-private-list.use-case";
import { RemoveFromPrivateListUseCase } from "./application/use-cases/remove-from-private-list.use-case";
import {
    ACCEPT_CONNECTION_USE_CASE, CANCEL_CONNECTION_USE_CASE, DECLINE_CONNECTION_USE_CASE,
    GET_CONNECTIONS_USE_CASE,
    REVOKE_MATCH_USE_CASE, SEND_CONNECTION_REQUEST_USE_CASE, SEND_PRIORITY_INTRO_USE_CASE
} from "./application/interfaces/connection.use-cases.interface";
import { ADD_TO_PRIVATE_LIST_USE_CASE, GET_PRIVATE_LIST_USE_CASE, REMOVE_FROM_PRIVATE_LIST_USE_CASE } from "./application/interfaces/private-list.use-cases.interface";
import { ConnectionSchema, ConnectionSchemaClass } from "./infrastructure/persistence/connection.schema";
import { ConnectionRepository } from "./infrastructure/persistence/mongo-connection.repository";
import { PrivateListSchema, PrivateListSchemaClass } from "./infrastructure/persistence/private-list.schema";
import { PrivateListRepository } from "./infrastructure/persistence/mongo-private-list.repository";
import { GetPrivateListUseCase } from "./application/use-cases/get-private-list.use-case";
import { GetConnectionsUseCase } from "./application/use-cases/get-connections.use-case";

class MockBillingFacade {
    async deductPriorityCredit(_userId: string): Promise<void> {
        return Promise.resolve();
    }
}

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: ConnectionSchemaClass.name, schema: ConnectionSchema },
            { name: PrivateListSchemaClass.name, schema: PrivateListSchema },
        ]),
        UserModule
    ],
    controllers: [ConnectionsController, PrivateListsController],
    providers: [
        { provide: CONNECTION_REPOSITORY, useClass: ConnectionRepository },
        { provide: PRIVATE_LIST_REPOSITORY, useClass: PrivateListRepository },
        { provide: BILLING_FACADE, useClass: MockBillingFacade },

        { provide: GET_CONNECTIONS_USE_CASE, useClass: GetConnectionsUseCase },
        { provide: SEND_CONNECTION_REQUEST_USE_CASE, useClass: SendConnectionRequestUseCase },
        { provide: SEND_PRIORITY_INTRO_USE_CASE, useClass: SendPriorityIntroUseCase },
        { provide: ACCEPT_CONNECTION_USE_CASE, useClass: AcceptConnectionUseCase },
        { provide: DECLINE_CONNECTION_USE_CASE, useClass: DeclineConnectionUseCase },
        { provide: CANCEL_CONNECTION_USE_CASE, useClass: CancelConnectionUseCase },
        { provide: REVOKE_MATCH_USE_CASE, useClass: RevokeMatchUseCase },

        { provide: GET_PRIVATE_LIST_USE_CASE, useClass: GetPrivateListUseCase },
        { provide: ADD_TO_PRIVATE_LIST_USE_CASE, useClass: AddToPrivateListUseCase },
        { provide: REMOVE_FROM_PRIVATE_LIST_USE_CASE, useClass: RemoveFromPrivateListUseCase },
    ]
})
export class ConnectionsModule { }