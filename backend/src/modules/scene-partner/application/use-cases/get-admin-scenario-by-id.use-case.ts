import { Inject, Injectable } from "@nestjs/common";
import { IGetAdminScenarioByIdUseCase } from "../interfaces/scene-partner-admin.use-cases.interface";
import { AdminScenarioResponseDto } from "../dtos/admin-scenario-response.dto";
import { IScenarioRepository, SCENARIO_REPOSITORY } from "../../domain/interfaces/scenario-repository.interface";
import { ISceneSessionRepository, SCENE_SESSION_REPOSITORY } from "../../domain/interfaces/scene-session-repository.interface";
import { ScenarioDtoMapper } from "../mappers/scenario-dto.mapper";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { SCENE_PARTNER_ERROR_MESSAGES } from "../../domain/constants/scene-partner.constants";

@Injectable()
export class GetAdminScenarioByIdUseCase implements IGetAdminScenarioByIdUseCase {
    constructor(
        @Inject(SCENARIO_REPOSITORY) private readonly _scenarioRepository: IScenarioRepository,
        @Inject(SCENE_SESSION_REPOSITORY) private readonly _sceneSessionRepository: ISceneSessionRepository,
    ) { }

    async execute(id: string): Promise<AdminScenarioResponseDto> {
        const [scenario, summaryStats] = await Promise.all([
            this._scenarioRepository.findById(id),
            this._sceneSessionRepository.getScenarioSummaryStats(id),
        ]);

        if (!scenario) {
            throw new DomainException(ErrorCode.USER_NOT_FOUND, SCENE_PARTNER_ERROR_MESSAGES.SCENARIO_NOT_FOUND);
        }

        return ScenarioDtoMapper.toAdminResponseDto(scenario, summaryStats);
    }
}
