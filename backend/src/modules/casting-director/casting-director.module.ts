import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CastingSessionSchema, CastingSessionSchemaClass } from "./infrastructure/persistence/casting-session.schema";
import { UserModule } from "../users/users.module";
import { CastingDirectorController } from "./presentation/controllers/casting-director.controller";
import { CASTING_SESSION_REPOSITORY } from "./domain/interfaces/casting-session-repository.interface";
import { MongoCastingSessionRepository } from "./infrastructure/persistence/mongo-casting-session.repository";
import { CASTING_AI_SERVICE } from "./domain/interfaces/casting-ai-service.interface";
import { OpenRouterCastingAiService } from "./infrastructure/services/openrouter-casting-ai.service";
import { INITIALIZE_CASTING_SESSION_USE_CASE } from "./application/interfaces/initialize-casting-session.use-case.interface";
import { InitializeCastingSessionUseCase } from "./application/use-cases/initialize-casting-session.use-case";
import { PROCESS_CASTING_MESSAGE_USE_CASE } from "./application/interfaces/process-casting-message.use-case.interface";
import { ProcessCastingMessageUseCase } from "./application/use-cases/process-casting-message.use-case";
import { FINALIZE_CASTING_SESSION_USE_CASE } from "./application/interfaces/finalize-casting-session.use-case.interface";
import { FinalizeCastingSessionUseCase } from "./application/use-cases/finalize-casting-session.use-case";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: CastingSessionSchemaClass.name, schema: CastingSessionSchema }]),
        UserModule,
    ],
    controllers: [CastingDirectorController],
    providers: [
        {
            provide: CASTING_SESSION_REPOSITORY,
            useClass: MongoCastingSessionRepository,
        },
        {
            provide: CASTING_AI_SERVICE,
            useClass: OpenRouterCastingAiService,
        },
        {
            provide: INITIALIZE_CASTING_SESSION_USE_CASE,
            useClass: InitializeCastingSessionUseCase,
        },
        {
            provide: PROCESS_CASTING_MESSAGE_USE_CASE,
            useClass: ProcessCastingMessageUseCase,
        },
        {
            provide: FINALIZE_CASTING_SESSION_USE_CASE,
            useClass: FinalizeCastingSessionUseCase
        }
    ]
})
export class CastingDirectorModule { }