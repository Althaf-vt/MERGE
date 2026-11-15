import { Inject, Injectable } from "@nestjs/common";
import { ICreateScenarioUseCase } from "../interfaces/scene-partner-admin.use-cases.interface";
import { CreateScenarioDto } from "../dtos/create-scenario.dto";
import { AdminScenarioResponseDto } from "../dtos/admin-scenario-response.dto";
import { IScenarioRepository, SCENARIO_REPOSITORY } from "../../domain/interfaces/scenario-repository.interface";
import { Scenario } from "../../domain/entities/scenario.entity";
import { ScenarioDtoMapper } from "../mappers/scenario-dto.mapper";

@Injectable()
export class CreateScenarioUseCase implements ICreateScenarioUseCase {
    constructor(
        @Inject(SCENARIO_REPOSITORY) private readonly _scenarioRepository: IScenarioRepository,
    ) { }

    async execute(dto: CreateScenarioDto): Promise<AdminScenarioResponseDto> {
        const id = `scenario-${Date.now()}`;
        const scenario = Scenario.createPredefined({
            id,
            title: dto.title,
            description: dto.description,
            category: dto.category,
            promptContext: dto.promptContext,
            isActive: true,
        });

        const saved = await this._scenarioRepository.create(scenario);
        return ScenarioDtoMapper.toAdminResponseDto(saved);
    }
}
