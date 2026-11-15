import { Inject, Injectable } from "@nestjs/common";
import { ICreateScenarioUseCase } from "../interfaces/scene-partner-admin.use-cases.interface";
import { AdminCreateScenarioParams } from "../interfaces/scene-partner-admin-facade.interface";
import { AdminScenarioResponseDto } from "../dtos/admin-scenario-response.dto";
import { IScenarioRepository, SCENARIO_REPOSITORY } from "../../domain/interfaces/scenario-repository.interface";
import { Scenario } from "../../domain/entities/scenario.entity";
import { ScenarioDtoMapper } from "../mappers/scenario-dto.mapper";

@Injectable()
export class CreateScenarioUseCase implements ICreateScenarioUseCase {
    constructor(
        @Inject(SCENARIO_REPOSITORY) private readonly _scenarioRepository: IScenarioRepository,
    ) { }

    async execute(params: AdminCreateScenarioParams): Promise<AdminScenarioResponseDto> {
        const id = `scenario-${Date.now()}`;
        const scenario = Scenario.createPredefined({
            id,
            title: params.title,
            description: params.description,
            category: params.category,
            promptContext: params.promptContext,
            isActive: true,
        });

        const saved = await this._scenarioRepository.create(scenario);
        return ScenarioDtoMapper.toAdminResponseDto(saved);
    }
}
