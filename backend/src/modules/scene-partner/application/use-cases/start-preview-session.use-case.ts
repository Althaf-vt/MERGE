import { Inject, Injectable } from "@nestjs/common";
import { IPreviewContextBuilder, IStartPreviewSessionUseCase, PREVIEW_CONTEXT_BUILDER } from "../interfaces/scene-partner-preview.use-cases.interface";
import { ScenePreviewResponseDto, StartScenePreviewDto } from "../dtos/preview-session.dto";
import { ISceneSessionRepository, SCENE_SESSION_REPOSITORY } from "../../domain/interfaces/scene-session-repository.interface";
import { IScenarioRepository, SCENARIO_REPOSITORY } from "../../domain/interfaces/scenario-repository.interface";
import { IScenePartnerAiService, SCENE_PARTNER_AI_SERVICE } from "../../domain/interfaces/scene-partner-ai.interface";
import { SceneSession } from "../../domain/entities/scene-session.entity";
import { ScenePreviewDtoMapper } from "../mappers/scene-preview-dto.mapper";
import { PREDEFINED_SCENARIOS } from "../../domain/constants/predefined-scenarios.constant";
import { SCENE_PARTNER_ERROR_MESSAGES, SCENE_PARTNER_POLICY } from "../../domain/constants/scene-partner.constants";
import { ScenarioCategory, SimulationType } from "../../../../shared/domain/enums/scene-partner.enums";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";

@Injectable()
export class StartPreviewSessionUseCase implements IStartPreviewSessionUseCase {
    constructor(
        @Inject(SCENE_SESSION_REPOSITORY) private readonly _sessionRepository: ISceneSessionRepository,
        @Inject(SCENARIO_REPOSITORY) private readonly _scenarioRepository: IScenarioRepository,
        @Inject(SCENE_PARTNER_AI_SERVICE) private readonly _aiService: IScenePartnerAiService,
        @Inject(PREVIEW_CONTEXT_BUILDER) private readonly _contextBuilder: IPreviewContextBuilder,
    ) { }

    async execute(adminId: string, dto: StartScenePreviewDto): Promise<ScenePreviewResponseDto> {
        let scenarioId: string;
        let scenarioTitle: string;
        let scenarioCategory: ScenarioCategory;
        let scenarioPromptContext: string | null = null;

        if (dto.scenarioId && dto.scenarioId.trim().length > 0) {
            const trimmedScenarioId = dto.scenarioId.trim();
            const foundScenario = await this._scenarioRepository.findById(trimmedScenarioId);
            if (foundScenario) {
                scenarioId = foundScenario.id;
                scenarioTitle = dto.title?.trim() || foundScenario.title;
                scenarioCategory = dto.category || foundScenario.category;
                scenarioPromptContext = dto.promptContext?.trim() || foundScenario.promptContext;
            } else {
                const predefined = PREDEFINED_SCENARIOS.find((s) => s.id === trimmedScenarioId);
                if (predefined) {
                    scenarioId = predefined.id;
                    scenarioTitle = dto.title?.trim() || predefined.title;
                    scenarioCategory = dto.category || predefined.category;
                    scenarioPromptContext = dto.promptContext?.trim() || predefined.promptContext;
                } else {
                    throw new DomainException(
                        ErrorCode.USER_NOT_FOUND,
                        SCENE_PARTNER_ERROR_MESSAGES.SCENARIO_NOT_FOUND,
                    );
                }
            }
        } else if (dto.title && dto.promptContext) {
            scenarioId = `preview-draft-${Date.now()}`;
            scenarioTitle = dto.title.trim();
            scenarioCategory = dto.category ?? ScenarioCategory.FIRST_MESSAGE;
            scenarioPromptContext = dto.promptContext.trim();
        } else {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, SCENE_PARTNER_ERROR_MESSAGES.INVALID_PREVIEW_CONFIG);
        }

        // 1. Build Standard Simulation Context for Preview
        const simulationContext = this._contextBuilder.build({
            scenarioTitle,
            scenarioCategory,
            promptContext: scenarioPromptContext || scenarioTitle,
            adminName: "Admin Reviewer",
        });

        // 2. Generate AI Partner Greeting
        const openingGreeting = await this._aiService.generateInitialGreeting(simulationContext);

        // 3. Create Sandbox Preview Aggregate Root
        const session = SceneSession.createPreview({
            userId: adminId,
            simulationType: SimulationType.GENERIC,
            scenarioId,
            scenarioTitle,
            scenarioCategory,
            scenarioPromptContext,
            isCoachingEnabled: dto.isCoachingEnabled ?? true,
            maxDurationMinutes: SCENE_PARTNER_POLICY.DEFAULT_MAX_DURATION_MINUTES,
        });

        session.startSession(openingGreeting);

        const savedSession = await this._sessionRepository.create(session);
        return ScenePreviewDtoMapper.toResponseDto(savedSession);
    }
}
