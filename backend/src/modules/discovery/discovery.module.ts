import { Module } from "@nestjs/common";
import { UserModule } from "../users/users.module";
import { DiscoveryController } from "./presentation/controllers/discovery.controller";
import { DISCOVERY_REPOSITORY } from "./domain/interfaces/discovery-repository.interface";
import { DiscoveryRepository } from "./infrastructure/persistence/mongo-discovery.repository";
import { GET_RECOMMENDATIONS_USE_CASE } from "./application/interfaces/get-recommendations.use-case.interface";
import { GetRecommendationsUseCase } from "./application/use-cases/get-recommendations.use-case";

@Module({
    imports: [UserModule], // Importing for USER_MANAGEMENT_FACADE, not schemas
    controllers: [DiscoveryController],
    providers: [
        {
            provide: DISCOVERY_REPOSITORY,
            useClass: DiscoveryRepository,
        },
        {
            provide: GET_RECOMMENDATIONS_USE_CASE,
            useClass: GetRecommendationsUseCase,
        }
    ],
    exports: []
})
export class DiscoveryModule { }