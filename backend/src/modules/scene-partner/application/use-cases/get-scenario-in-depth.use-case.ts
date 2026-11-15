import { Inject, Injectable } from "@nestjs/common";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { ScenarioTimeframe } from "../../../../shared/domain/enums/scene-partner.enums";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { SCENE_PARTNER_ANALYTICS_POLICY, SCENE_PARTNER_ERROR_MESSAGES } from "../../domain/constants/scene-partner.constants";
import { IScenarioRepository, SCENARIO_REPOSITORY } from "../../domain/interfaces/scenario-repository.interface";
import { ISceneSessionRepository, SCENE_SESSION_REPOSITORY } from "../../domain/interfaces/scene-session-repository.interface";
import { ScenarioInDepthDto } from "../dtos/scenario-in-depth.dto";
import { IGetScenarioInDepthUseCase } from "../interfaces/scene-partner-in-depth.use-cases.interface";
import { ScenarioInDepthDtoMapper } from "../mappers/scenario-in-depth-dto.mapper";

@Injectable()
export class GetScenarioInDepthUseCase implements IGetScenarioInDepthUseCase {
    constructor(
        @Inject(SCENARIO_REPOSITORY) private readonly _scenarioRepository: IScenarioRepository,
        @Inject(SCENE_SESSION_REPOSITORY) private readonly _sceneSessionRepository: ISceneSessionRepository,
    ) { }

    async execute(scenarioId: string, timeframe: ScenarioTimeframe = SCENE_PARTNER_ANALYTICS_POLICY.DEFAULT_TIMEFRAME): Promise<ScenarioInDepthDto> {
        const days = SCENE_PARTNER_ANALYTICS_POLICY.TIMEFRAME_DAYS_MAP[timeframe]
            ?? SCENE_PARTNER_ANALYTICS_POLICY.TIMEFRAME_DAYS_MAP[SCENE_PARTNER_ANALYTICS_POLICY.DEFAULT_TIMEFRAME];

        const [scenario, summary, trends, recentSessions] = await Promise.all([
            this._scenarioRepository.findById(scenarioId),
            this._sceneSessionRepository.getScenarioSummaryStats(scenarioId),
            this._sceneSessionRepository.getScenarioDailyTrends(scenarioId, days),
            this._sceneSessionRepository.findRecentByScenarioId(
                scenarioId,
                SCENE_PARTNER_ANALYTICS_POLICY.RECENT_SESSIONS_LIMIT,
            ),
        ]);

        if (!scenario) {
            throw new DomainException(ErrorCode.USER_NOT_FOUND, SCENE_PARTNER_ERROR_MESSAGES.SCENARIO_NOT_FOUND);
        }

        return ScenarioInDepthDtoMapper.toDto({
            scenario,
            summary,
            timeframe,
            trends,
            recentSessions,
        });
    }
}
