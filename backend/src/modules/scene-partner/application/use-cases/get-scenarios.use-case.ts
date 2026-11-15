import { Inject, Injectable } from "@nestjs/common";
import { IGetScenariosUseCase } from "../interfaces/scene-partner.use-cases.interface";
import { ScenarioResponseDto } from "../dtos/scenario-response.dto";
import { ScenarioCategory } from "../../../../shared/domain/enums/scene-partner.enums";
import { IScenarioRepository, SCENARIO_REPOSITORY } from "../../domain/interfaces/scenario-repository.interface";
import { ScenarioDtoMapper } from "../mappers/scenario-dto.mapper";

@Injectable()
export class GetScenariosUseCase implements IGetScenariosUseCase {
    constructor(
        @Inject(SCENARIO_REPOSITORY) private readonly _scenarioRepository: IScenarioRepository,
    ) { }

    async execute(category?: ScenarioCategory): Promise<ScenarioResponseDto[]> {
        const scenarios = await this._scenarioRepository.findActive(category);
        return ScenarioDtoMapper.toScenarioResponseDtoList(scenarios);
    }
}
