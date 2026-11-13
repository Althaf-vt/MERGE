import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../../shared/infrastructure/security/guards/jwt-auth.guard";
import { UserSessionGuard } from "../../../../shared/infrastructure/security/guards/user-session.guard";
import { API_ENDPOINTS } from "../../../../shared/presentation/constants/api-endpoints.constant";
import { RESPONSE_MESSAGES } from "../../../../shared/presentation/constants/response-messages.constant";
import { ApiResponse } from "../../../../shared/presentation/interfaces/api-response.interface";
import { ApiResponseHelper } from "../../../../shared/presentation/utils/api-response.helper";
import { AuthenticatedRequest } from "../../../../shared/infrastructure/security/interfaces/authenticated-request.interface";
import { StartSceneSessionDto } from "../../application/dtos/start-scene-session.dto";
import { SendSceneTurnDto } from "../../application/dtos/send-scene-turn.dto";
import { PaginatedSceneSessionsResponseDto, SceneSessionResponseDto } from "../../application/dtos/scene-session-response.dto";
import { ScenarioResponseDto } from "../../application/dtos/scenario-response.dto";
import { GetScenariosQueryDto } from "../../application/dtos/get-scenarios-query.dto";
import { GetSceneHistoryQueryDto } from "../../application/dtos/get-scene-history-query.dto";
import {
    END_SCENE_SESSION_USE_CASE,
    GET_ACTIVE_SCENE_SESSION_USE_CASE,
    GET_SCENARIOS_USE_CASE,
    GET_SCENE_SESSION_BY_ID_USE_CASE,
    GET_SCENE_SESSION_HISTORY_USE_CASE,
    IEndSceneSessionUseCase,
    IGetActiveSceneSessionUseCase,
    IGetScenariosUseCase,
    IGetSceneSessionByIdUseCase,
    IGetSceneSessionHistoryUseCase,
    IPauseSceneSessionUseCase,
    IResumeSceneSessionUseCase,
    ISendSceneTurnUseCase,
    IStartSceneSessionUseCase,
    PAUSE_SCENE_SESSION_USE_CASE,
    RESUME_SCENE_SESSION_USE_CASE,
    SEND_SCENE_TURN_USE_CASE,
    START_SCENE_SESSION_USE_CASE,
} from "../../application/interfaces/scene-partner.use-cases.interface";

@Controller(API_ENDPOINTS.SCENE_PARTNER.BASE)
@UseGuards(JwtAuthGuard, UserSessionGuard)
export class ScenePartnerController {
    constructor(
        @Inject(START_SCENE_SESSION_USE_CASE) private readonly _startSceneSessionUseCase: IStartSceneSessionUseCase,
        @Inject(SEND_SCENE_TURN_USE_CASE) private readonly _sendSceneTurnUseCase: ISendSceneTurnUseCase,
        @Inject(PAUSE_SCENE_SESSION_USE_CASE) private readonly _pauseSceneSessionUseCase: IPauseSceneSessionUseCase,
        @Inject(RESUME_SCENE_SESSION_USE_CASE) private readonly _resumeSceneSessionUseCase: IResumeSceneSessionUseCase,
        @Inject(END_SCENE_SESSION_USE_CASE) private readonly _endSceneSessionUseCase: IEndSceneSessionUseCase,
        @Inject(GET_ACTIVE_SCENE_SESSION_USE_CASE) private readonly _getActiveSceneSessionUseCase: IGetActiveSceneSessionUseCase,
        @Inject(GET_SCENE_SESSION_BY_ID_USE_CASE) private readonly _getSceneSessionByIdUseCase: IGetSceneSessionByIdUseCase,
        @Inject(GET_SCENE_SESSION_HISTORY_USE_CASE) private readonly _getSceneSessionHistoryUseCase: IGetSceneSessionHistoryUseCase,
        @Inject(GET_SCENARIOS_USE_CASE) private readonly _getScenariosUseCase: IGetScenariosUseCase,
    ) { }

    @Post(API_ENDPOINTS.SCENE_PARTNER.SESSIONS)
    @HttpCode(HttpStatus.CREATED)
    async startSession(
        @Req() req: AuthenticatedRequest,
        @Body() dto: StartSceneSessionDto,
    ): Promise<ApiResponse<SceneSessionResponseDto>> {
        const session = await this._startSceneSessionUseCase.execute(req.user.userId, dto);
        return ApiResponseHelper.success(RESPONSE_MESSAGES.SCENE_PARTNER.SESSION_STARTED, session);
    }

    @Post(API_ENDPOINTS.SCENE_PARTNER.MESSAGE)
    @HttpCode(HttpStatus.OK)
    async sendTurn(
        @Req() req: AuthenticatedRequest,
        @Param("id") id: string,
        @Body() dto: SendSceneTurnDto,
    ): Promise<ApiResponse<SceneSessionResponseDto>> {
        const session = await this._sendSceneTurnUseCase.execute(req.user.userId, id, dto);
        return ApiResponseHelper.success(RESPONSE_MESSAGES.SCENE_PARTNER.TURN_PROCESSED, session);
    }

    @Post(API_ENDPOINTS.SCENE_PARTNER.PAUSE)
    @HttpCode(HttpStatus.OK)
    async pauseSession(
        @Req() req: AuthenticatedRequest,
        @Param("id") id: string,
    ): Promise<ApiResponse<SceneSessionResponseDto>> {
        const session = await this._pauseSceneSessionUseCase.execute(req.user.userId, id);
        return ApiResponseHelper.success(RESPONSE_MESSAGES.SCENE_PARTNER.SESSION_PAUSED, session);
    }

    @Post(API_ENDPOINTS.SCENE_PARTNER.RESUME)
    @HttpCode(HttpStatus.OK)
    async resumeSession(
        @Req() req: AuthenticatedRequest,
        @Param("id") id: string,
    ): Promise<ApiResponse<SceneSessionResponseDto>> {
        const session = await this._resumeSceneSessionUseCase.execute(req.user.userId, id);
        return ApiResponseHelper.success(RESPONSE_MESSAGES.SCENE_PARTNER.SESSION_RESUMED, session);
    }

    @Post(API_ENDPOINTS.SCENE_PARTNER.END)
    @HttpCode(HttpStatus.OK)
    async endSession(
        @Req() req: AuthenticatedRequest,
        @Param("id") id: string,
    ): Promise<ApiResponse<SceneSessionResponseDto>> {
        const session = await this._endSceneSessionUseCase.execute(req.user.userId, id);
        return ApiResponseHelper.success(RESPONSE_MESSAGES.SCENE_PARTNER.SESSION_ENDED, session);
    }

    @Get(API_ENDPOINTS.SCENE_PARTNER.ACTIVE_SESSION)
    @HttpCode(HttpStatus.OK)
    async getActiveSession(
        @Req() req: AuthenticatedRequest,
    ): Promise<ApiResponse<SceneSessionResponseDto | null>> {
        const session = await this._getActiveSceneSessionUseCase.execute(req.user.userId);
        return ApiResponseHelper.success(RESPONSE_MESSAGES.SCENE_PARTNER.ACTIVE_SESSION_FETCHED, session);
    }

    @Get(API_ENDPOINTS.SCENE_PARTNER.HISTORY)
    @HttpCode(HttpStatus.OK)
    async getHistory(
        @Req() req: AuthenticatedRequest,
        @Query() query: GetSceneHistoryQueryDto,
    ): Promise<ApiResponse<PaginatedSceneSessionsResponseDto>> {
        const history = await this._getSceneSessionHistoryUseCase.execute(
            req.user.userId,
            query.limit,
            query.skip,
        );
        return ApiResponseHelper.success(RESPONSE_MESSAGES.SCENE_PARTNER.HISTORY_FETCHED, history);
    }

    @Get(API_ENDPOINTS.SCENE_PARTNER.SCENARIOS)
    @HttpCode(HttpStatus.OK)
    async getScenarios(
        @Query() query: GetScenariosQueryDto,
    ): Promise<ApiResponse<ScenarioResponseDto[]>> {
        const scenarios = await this._getScenariosUseCase.execute(query.category);
        return ApiResponseHelper.success(RESPONSE_MESSAGES.SCENE_PARTNER.SCENARIOS_FETCHED, scenarios);
    }
    
    @Get(API_ENDPOINTS.SCENE_PARTNER.SESSION_BY_ID)
    @HttpCode(HttpStatus.OK)
    async getSessionById(
        @Req() req: AuthenticatedRequest,
        @Param("id") id: string,
    ): Promise<ApiResponse<SceneSessionResponseDto>> {
        const session = await this._getSceneSessionByIdUseCase.execute(req.user.userId, id);
        return ApiResponseHelper.success(RESPONSE_MESSAGES.SCENE_PARTNER.SESSION_FETCHED, session);
    }
}

