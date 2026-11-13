import { Injectable } from "@nestjs/common";
import { IGetScenariosUseCase } from "../interfaces/scene-partner.use-cases.interface";
import { ScenarioResponseDto } from "../dtos/scenario-response.dto";
import { ScenarioCategory } from "../../domain/enums/scene-partner.enums";
import { PREDEFINED_SCENARIOS } from "../../domain/constants/predefined-scenarios.constant";
import { SceneSessionDtoMapper } from "../mappers/scene-session-dto.mapper";

@Injectable()
export class GetScenariosUseCase implements IGetScenariosUseCase {
    async execute(category?: ScenarioCategory): Promise<ScenarioResponseDto[]> {
        const scenarios = category
            ? PREDEFINED_SCENARIOS.filter((s) => s.category === category)
            : [...PREDEFINED_SCENARIOS];

        return scenarios.map((scenario) => SceneSessionDtoMapper.toScenarioResponseDto(scenario));
    }
}
