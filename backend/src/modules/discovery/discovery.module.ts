import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UserModule } from "../users/users.module";
import { ConnectionsModule } from "../connections/connections.module";
import { DiscoveryController } from "./presentation/controllers/discovery.controller";
import { DISCOVERY_REPOSITORY } from "./domain/interfaces/discovery-repository.interface";
import { DiscoveryRepository } from "./infrastructure/persistence/mongo-discovery.repository";
import { GET_RECOMMENDATIONS_USE_CASE } from "./application/interfaces/get-recommendations.use-case.interface";
import { GetRecommendationsUseCase } from "./application/use-cases/get-recommendations.use-case";
import { PASS_CANDIDATE_USE_CASE } from "./application/interfaces/pass-candidate.use-case.interface";
import { PassCandidateUseCase } from "./application/use-cases/pass-candidate.use-case";
import { DiscoveryPassSchema, DiscoveryPassSchemaClass } from "./infrastructure/persistence/discovery-pass.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: DiscoveryPassSchemaClass.name, schema: DiscoveryPassSchema },
        ]),
        UserModule,
        ConnectionsModule,
    ],
    controllers: [DiscoveryController],
    providers: [
        {
            provide: DISCOVERY_REPOSITORY,
            useClass: DiscoveryRepository,
        },
        {
            provide: GET_RECOMMENDATIONS_USE_CASE,
            useClass: GetRecommendationsUseCase,
        },
        {
            provide: PASS_CANDIDATE_USE_CASE,
            useClass: PassCandidateUseCase,
        },
    ],
    exports: []
})
export class DiscoveryModule { }
