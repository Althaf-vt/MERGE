import { Inject, Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { IScenarioRepository, SCENARIO_REPOSITORY } from "../../domain/interfaces/scenario-repository.interface";
import { PREDEFINED_SCENARIOS } from "../../domain/constants/predefined-scenarios.constant";

@Injectable()
export class ScenarioSeederService implements OnApplicationBootstrap {
    private readonly _logger = new Logger(ScenarioSeederService.name);

    constructor(
        @Inject(SCENARIO_REPOSITORY) private readonly _scenarioRepository: IScenarioRepository,
    ) { }

    async onApplicationBootstrap(): Promise<void> {
        try {
            const count = await this._scenarioRepository.count();
            if (count > 0) {
                this._logger.log("Scenarios already exist in database. Skipping seeder.");
                return;
            }

            for (const scenario of PREDEFINED_SCENARIOS) {
                await this._scenarioRepository.create(scenario);
            }

            this._logger.log(`Successfully seeded ${PREDEFINED_SCENARIOS.length} initial predefined scenarios into database.`);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorStack = error instanceof Error ? error.stack : undefined;
            this._logger.error(`Failed to seed scenarios on application bootstrap: ${errorMessage}`, errorStack);
        }
    }
}
