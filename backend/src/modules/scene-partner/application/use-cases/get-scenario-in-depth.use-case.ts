import { Inject, Injectable } from "@nestjs/common";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { SCENE_PARTNER_ERROR_MESSAGES } from "../../domain/constants/scene-partner.constants";
import { IScenarioRepository, SCENARIO_REPOSITORY } from "../../domain/interfaces/scenario-repository.interface";
import { ISceneSessionRepository, SCENE_SESSION_REPOSITORY } from "../../domain/interfaces/scene-session-repository.interface";
import { ScenarioInDepthDto, ScenarioTimeframe } from "../dtos/scenario-in-depth.dto";
import { IGetScenarioInDepthUseCase } from "../interfaces/scene-partner-in-depth.use-cases.interface";
import { ScenarioInDepthDtoMapper } from "../mappers/scenario-in-depth-dto.mapper";

@Injectable()
export class GetScenarioInDepthUseCase implements IGetScenarioInDepthUseCase {
    private static readonly DEFAULT_TIMEFRAME: ScenarioTimeframe = '30D';
    private static readonly RECENT_SESSIONS_LIMIT = 5;

    constructor(
        @Inject(SCENARIO_REPOSITORY) private readonly _scenarioRepository: IScenarioRepository,
        @Inject(SCENE_SESSION_REPOSITORY) private readonly _sceneSessionRepository: ISceneSessionRepository,
    ) { }

    async execute(scenarioId: string, timeframe: ScenarioTimeframe = GetScenarioInDepthUseCase.DEFAULT_TIMEFRAME): Promise<ScenarioInDepthDto> {
        const days = this._parseDays(timeframe);

        const [scenario, summary, trends, recentSessions] = await Promise.all([
            this._scenarioRepository.findById(scenarioId),
            this._sceneSessionRepository.getScenarioSummaryStats(scenarioId),
            this._sceneSessionRepository.getScenarioDailyTrends(scenarioId, days),
            this._sceneSessionRepository.findRecentByScenarioId(scenarioId, GetScenarioInDepthUseCase.RECENT_SESSIONS_LIMIT),
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

    private _parseDays(timeframe: ScenarioTimeframe): number {
        switch (timeframe) {
            case '7D':
                return 7;
            case '90D':
                return 90;
            case '30D':
            default:
                return 30;
        }
    }
}
