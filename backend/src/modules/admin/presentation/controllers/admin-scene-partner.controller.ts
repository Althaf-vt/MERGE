import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Query, Req, StreamableFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { JwtAuthGuard } from "../../../../shared/infrastructure/security/guards/jwt-auth.guard";
import { AdminSessionGuard } from "../../infrastructure/security/guards/admin-session.guard";
import { AdminPermissionsGuard } from "../../../../shared/infrastructure/security/guards/admin-permissions.guard";
import { RequirePermissions } from "../../../../shared/infrastructure/security/decorators/require-permissions.decorator";
import { AdminPermission } from "../../domain/enums/admin-permission.enums";
import { API_ENDPOINTS } from "../../../../shared/presentation/constants/api-endpoints.constant";
import { ApiResponse } from "../../../../shared/presentation/interfaces/api-response.interface";
import { RESPONSE_MESSAGES } from "../../../../shared/presentation/constants/response-messages.constant";
import { ApiResponseHelper } from "../../../../shared/presentation/utils/api-response.helper";
import { AuthenticatedRequest } from "../../../../shared/infrastructure/security/interfaces/authenticated-request.interface";
import {
    AdminPreviewSessionFacadeDto,
    AdminScenarioExportItemFacadeDto,
    AdminScenarioFacadeDto,
    AdminScenarioInDepthFacadeDto,
    AdminSessionDetailFacadeDto,
    AdminSessionListItemFacadeDto,
    ScenePartnerAnalyticsFacadeDto,
} from "../../../scene-partner/application/interfaces/scene-partner-admin-facade.interface";
import {
    AdminCreateScenarioDto,
    AdminExportScenariosQueryDto,
    AdminGetScenarioInDepthQueryDto,
    AdminGetScenariosQueryDto,
    AdminGetSessionsQueryDto,
    AdminSendPreviewTurnDto,
    AdminStartPreviewDto,
    AdminToggleScenarioStatusDto,
    AdminUpdatePreviewCoachingDto,
    AdminUpdateScenarioDto,
    ScenarioExportFormat,
} from "../../application/dtos/admin-scene-partner.dto";
import { CsvSerializer } from "../../application/utils/csv-serializer.util";
import { AdminAuditAction, AdminAuditResourceType } from "../../domain/enums/admin-audit.enums";
import { AuditLog } from "../decorators/audit-log.decorator";
import { AdminAuditInterceptor } from "../interceptors/admin-audit.interceptor";
import { GET_SCENARIO_ACTIVITY_HISTORY_USE_CASE, IGetScenarioActivityHistoryUseCase } from "../../application/interfaces/admin-audit.use-cases.interface";
import { AdminAuditLogResponseDto, GetScenarioActivityHistoryQueryDto } from "../../application/dtos/admin-audit-log.dto";
import {
    ADMIN_CREATE_SCENARIO_USE_CASE,
    ADMIN_EXPORT_SCENARIOS_USE_CASE,
    ADMIN_GET_SCENARIO_BY_ID_USE_CASE,
    ADMIN_GET_SCENARIO_IN_DEPTH_USE_CASE,
    ADMIN_GET_SCENARIOS_USE_CASE,
    ADMIN_GET_SCENE_ANALYTICS_USE_CASE,
    ADMIN_GET_SCENE_SESSION_DETAILS_USE_CASE,
    ADMIN_GET_SCENE_SESSIONS_USE_CASE,
    ADMIN_SEND_PREVIEW_TURN_USE_CASE,
    ADMIN_START_PREVIEW_SESSION_USE_CASE,
    ADMIN_TOGGLE_SCENARIO_STATUS_USE_CASE,
    ADMIN_UPDATE_PREVIEW_COACHING_USE_CASE,
    ADMIN_UPDATE_SCENARIO_USE_CASE,
    IAdminCreateScenarioUseCase,
    IAdminExportScenariosUseCase,
    IAdminGetScenarioByIdUseCase,
    IAdminGetScenarioInDepthUseCase,
    IAdminGetScenariosUseCase,
    IAdminGetSceneAnalyticsUseCase,
    IAdminGetSceneSessionDetailsUseCase,
    IAdminGetSceneSessionsUseCase,
    IAdminSendPreviewTurnUseCase,
    IAdminStartPreviewSessionUseCase,
    IAdminToggleScenarioStatusUseCase,
    IAdminUpdatePreviewCoachingUseCase,
    IAdminUpdateScenarioUseCase,
} from "../../application/interfaces/admin-scene-partner.use-cases.interface";

@Controller(API_ENDPOINTS.ADMIN.SCENE_PARTNER.BASE)
@UseGuards(JwtAuthGuard, AdminSessionGuard, AdminPermissionsGuard)
@UseInterceptors(AdminAuditInterceptor)
export class AdminScenePartnerController {
    constructor(
        @Inject(ADMIN_CREATE_SCENARIO_USE_CASE) private readonly _createScenarioUseCase: IAdminCreateScenarioUseCase,
        @Inject(ADMIN_GET_SCENARIOS_USE_CASE) private readonly _getScenariosUseCase: IAdminGetScenariosUseCase,
        @Inject(ADMIN_EXPORT_SCENARIOS_USE_CASE) private readonly _exportScenariosUseCase: IAdminExportScenariosUseCase,
        @Inject(ADMIN_GET_SCENARIO_BY_ID_USE_CASE) private readonly _getScenarioByIdUseCase: IAdminGetScenarioByIdUseCase,
        @Inject(ADMIN_GET_SCENARIO_IN_DEPTH_USE_CASE) private readonly _getScenarioInDepthUseCase: IAdminGetScenarioInDepthUseCase,
        @Inject(ADMIN_TOGGLE_SCENARIO_STATUS_USE_CASE) private readonly _toggleScenarioStatusUseCase: IAdminToggleScenarioStatusUseCase,
        @Inject(ADMIN_UPDATE_SCENARIO_USE_CASE) private readonly _updateScenarioUseCase: IAdminUpdateScenarioUseCase,
        @Inject(ADMIN_GET_SCENE_ANALYTICS_USE_CASE) private readonly _getSceneAnalyticsUseCase: IAdminGetSceneAnalyticsUseCase,
        @Inject(ADMIN_GET_SCENE_SESSIONS_USE_CASE) private readonly _getSceneSessionsUseCase: IAdminGetSceneSessionsUseCase,
        @Inject(ADMIN_GET_SCENE_SESSION_DETAILS_USE_CASE) private readonly _getSceneSessionDetailsUseCase: IAdminGetSceneSessionDetailsUseCase,
        @Inject(ADMIN_START_PREVIEW_SESSION_USE_CASE) private readonly _startPreviewSessionUseCase: IAdminStartPreviewSessionUseCase,
        @Inject(ADMIN_SEND_PREVIEW_TURN_USE_CASE) private readonly _sendPreviewTurnUseCase: IAdminSendPreviewTurnUseCase,
        @Inject(ADMIN_UPDATE_PREVIEW_COACHING_USE_CASE) private readonly _updatePreviewCoachingUseCase: IAdminUpdatePreviewCoachingUseCase,
        @Inject(GET_SCENARIO_ACTIVITY_HISTORY_USE_CASE) private readonly _getScenarioActivityHistoryUseCase: IGetScenarioActivityHistoryUseCase,
    ) { }

    @Post(API_ENDPOINTS.ADMIN.SCENE_PARTNER.SCENARIOS)
    @HttpCode(HttpStatus.CREATED)
    @RequirePermissions(AdminPermission.SCENE_PARTNER_MANAGE)
    @AuditLog<AdminScenarioFacadeDto>({
        action: AdminAuditAction.SCENARIO_CREATED,
        resourceType: AdminAuditResourceType.SCENARIO,
        extractResourceId: (_req, res) => res.data?.id,
        extractDetails: (_req, res) => ({
            title: res.data?.title,
            category: res.data?.category,
            isActive: res.data?.isActive,
        }),
    })
    async createScenario(
        @Body() dto: AdminCreateScenarioDto,
    ): Promise<ApiResponse<AdminScenarioFacadeDto>> {
        const result = await this._createScenarioUseCase.execute(dto);
        return ApiResponseHelper.success(RESPONSE_MESSAGES.ADMIN.SCENE_PARTNER.SCENARIO_CREATED, result);
    }

    @Get(API_ENDPOINTS.ADMIN.SCENE_PARTNER.SCENARIOS)
    @HttpCode(HttpStatus.OK)
    @RequirePermissions(AdminPermission.SCENE_PARTNER_MANAGE)
    async getScenarios(
        @Query() query: AdminGetScenariosQueryDto,
    ): Promise<ApiResponse<AdminScenarioFacadeDto[]>> {
        const result = await this._getScenariosUseCase.execute(query);
        return ApiResponseHelper.success(
            RESPONSE_MESSAGES.ADMIN.SCENE_PARTNER.SCENARIOS_FETCHED,
            result.data,
            {
                total: result.total,
                page: result.page,
                limit: result.limit,
            },
        );
    }

    @Get(API_ENDPOINTS.ADMIN.SCENE_PARTNER.SCENARIOS_EXPORT)
    @HttpCode(HttpStatus.OK)
    @RequirePermissions(AdminPermission.SCENE_PARTNER_MANAGE)
    async exportScenarios(
        @Query() query: AdminExportScenariosQueryDto,
    ): Promise<ApiResponse<AdminScenarioExportItemFacadeDto[]> | StreamableFile> {
        const result = await this._exportScenariosUseCase.execute(query);

        if (query.format === ScenarioExportFormat.CSV) {
            return CsvSerializer.toStreamableFile(result);
        }

        return ApiResponseHelper.success(RESPONSE_MESSAGES.ADMIN.SCENE_PARTNER.SCENARIOS_EXPORTED, result);
    }

    @Get(API_ENDPOINTS.ADMIN.SCENE_PARTNER.ANALYTICS)
    @HttpCode(HttpStatus.OK)
    @RequirePermissions(AdminPermission.SCENE_PARTNER_MANAGE)
    async getAnalytics(): Promise<ApiResponse<ScenePartnerAnalyticsFacadeDto>> {
        const result = await this._getSceneAnalyticsUseCase.execute();
        return ApiResponseHelper.success(RESPONSE_MESSAGES.ADMIN.SCENE_PARTNER.ANALYTICS_FETCHED, result);
    }

    @Get(API_ENDPOINTS.ADMIN.SCENE_PARTNER.SESSIONS)
    @HttpCode(HttpStatus.OK)
    @RequirePermissions(AdminPermission.SCENE_PARTNER_MANAGE)
    async getSessions(
        @Query() query: AdminGetSessionsQueryDto,
    ): Promise<ApiResponse<AdminSessionListItemFacadeDto[]>> {
        const result = await this._getSceneSessionsUseCase.execute(query);
        return ApiResponseHelper.success(
            RESPONSE_MESSAGES.ADMIN.SCENE_PARTNER.SESSIONS_FETCHED,
            result.data,
            {
                total: result.total,
                page: result.page,
                limit: result.limit,
            },
        );
    }

    @Get(API_ENDPOINTS.ADMIN.SCENE_PARTNER.SESSION_BY_ID)
    @HttpCode(HttpStatus.OK)
    @RequirePermissions(AdminPermission.SCENE_PARTNER_MANAGE)
    async getSessionDetails(
        @Param("id") id: string,
    ): Promise<ApiResponse<AdminSessionDetailFacadeDto>> {
        const result = await this._getSceneSessionDetailsUseCase.execute(id);
        return ApiResponseHelper.success(RESPONSE_MESSAGES.ADMIN.SCENE_PARTNER.SESSION_DETAILS_FETCHED, result);
    }

    @Get(API_ENDPOINTS.ADMIN.SCENE_PARTNER.SCENARIO_BY_ID)
    @HttpCode(HttpStatus.OK)
    @RequirePermissions(AdminPermission.SCENE_PARTNER_MANAGE)
    async getScenarioById(
        @Param("id") id: string,
    ): Promise<ApiResponse<AdminScenarioFacadeDto>> {
        const result = await this._getScenarioByIdUseCase.execute(id);
        return ApiResponseHelper.success(RESPONSE_MESSAGES.ADMIN.SCENE_PARTNER.SCENARIO_FETCHED, result);
    }

    @Get(API_ENDPOINTS.ADMIN.SCENE_PARTNER.SCENARIO_IN_DEPTH)
    @HttpCode(HttpStatus.OK)
    @RequirePermissions(AdminPermission.SCENE_PARTNER_MANAGE)
    async getScenarioInDepth(
        @Param("id") id: string,
        @Query() query: AdminGetScenarioInDepthQueryDto,
    ): Promise<ApiResponse<AdminScenarioInDepthFacadeDto>> {
        const result = await this._getScenarioInDepthUseCase.execute(id, query.timeframe);
        return ApiResponseHelper.success(RESPONSE_MESSAGES.ADMIN.SCENE_PARTNER.SCENARIO_IN_DEPTH_FETCHED, result);
    }

    @Get(API_ENDPOINTS.ADMIN.SCENE_PARTNER.SCENARIO_ACTIVITY_HISTORY)
    @HttpCode(HttpStatus.OK)
    @RequirePermissions(AdminPermission.SCENE_PARTNER_MANAGE)
    async getScenarioActivityHistory(
        @Param("id") id: string,
        @Query() query: GetScenarioActivityHistoryQueryDto,
    ): Promise<ApiResponse<AdminAuditLogResponseDto[]>> {
        const result = await this._getScenarioActivityHistoryUseCase.execute(id, query);
        return ApiResponseHelper.success(
            RESPONSE_MESSAGES.ADMIN.SCENE_PARTNER.SCENARIO_ACTIVITY_HISTORY_FETCHED,
            result.data,
            {
                total: result.total,
                page: result.page,
                limit: result.limit,
            },
        );
    }

    @Patch(API_ENDPOINTS.ADMIN.SCENE_PARTNER.SCENARIO_STATUS)
    @HttpCode(HttpStatus.OK)
    @RequirePermissions(AdminPermission.SCENE_PARTNER_MANAGE)
    @AuditLog<AdminScenarioFacadeDto>({
        action: (_req, res) => (res.data?.isActive ? AdminAuditAction.STATUS_ACTIVATED : AdminAuditAction.STATUS_DEACTIVATED),
        resourceType: AdminAuditResourceType.SCENARIO,
        extractResourceId: (_req, res) => res.data?.id,
        extractDetails: (_req, res) => ({
            title: res.data?.title,
            isActive: res.data?.isActive,
        }),
    })
    async toggleScenarioStatus(
        @Param("id") id: string,
        @Body() dto: AdminToggleScenarioStatusDto,
    ): Promise<ApiResponse<AdminScenarioFacadeDto>> {
        const result = await this._toggleScenarioStatusUseCase.execute(id, dto);
        return ApiResponseHelper.success(RESPONSE_MESSAGES.ADMIN.SCENE_PARTNER.SCENARIO_STATUS_UPDATED, result);
    }

    @Patch(API_ENDPOINTS.ADMIN.SCENE_PARTNER.SCENARIO_BY_ID)
    @HttpCode(HttpStatus.OK)
    @RequirePermissions(AdminPermission.SCENE_PARTNER_MANAGE)
    @AuditLog<AdminScenarioFacadeDto>({
        action: AdminAuditAction.SCENARIO_UPDATED,
        resourceType: AdminAuditResourceType.SCENARIO,
        extractResourceId: (_req, res) => res.data?.id,
        extractDetails: (req, res) => ({
            title: res.data?.title,
            category: res.data?.category,
            updatedFields: Object.keys(req.body ?? {}),
        }),
    })
    async updateScenario(
        @Param("id") id: string,
        @Body() dto: AdminUpdateScenarioDto,
    ): Promise<ApiResponse<AdminScenarioFacadeDto>> {
        const result = await this._updateScenarioUseCase.execute(id, dto);
        return ApiResponseHelper.success(RESPONSE_MESSAGES.ADMIN.SCENE_PARTNER.SCENARIO_UPDATED, result);
    }

    @Post(API_ENDPOINTS.ADMIN.SCENE_PARTNER.PREVIEW_START)
    @HttpCode(HttpStatus.CREATED)
    @RequirePermissions(AdminPermission.SCENE_PARTNER_MANAGE)
    async startDraftPreview(
        @Body() dto: AdminStartPreviewDto,
        @Req() req: AuthenticatedRequest,
    ): Promise<ApiResponse<AdminPreviewSessionFacadeDto>> {
        const adminId = req.user.userId;
        const result = await this._startPreviewSessionUseCase.execute(adminId, dto);
        return ApiResponseHelper.success(RESPONSE_MESSAGES.ADMIN.SCENE_PARTNER.PREVIEW_STARTED, result);
    }

    @Post(API_ENDPOINTS.ADMIN.SCENE_PARTNER.SCENARIO_PREVIEW_START)
    @HttpCode(HttpStatus.CREATED)
    @RequirePermissions(AdminPermission.SCENE_PARTNER_MANAGE)
    async startScenarioPreview(
        @Param("id") scenarioId: string,
        @Body() dto: AdminStartPreviewDto,
        @Req() req: AuthenticatedRequest,
    ): Promise<ApiResponse<AdminPreviewSessionFacadeDto>> {
        const adminId = req.user.userId;
        const result = await this._startPreviewSessionUseCase.execute(adminId, {
            ...dto,
            scenarioId,
        });
        return ApiResponseHelper.success(RESPONSE_MESSAGES.ADMIN.SCENE_PARTNER.PREVIEW_STARTED, result);
    }

    @Post(API_ENDPOINTS.ADMIN.SCENE_PARTNER.PREVIEW_MESSAGE)
    @HttpCode(HttpStatus.OK)
    @RequirePermissions(AdminPermission.SCENE_PARTNER_MANAGE)
    async sendPreviewTurn(
        @Param("id") sessionId: string,
        @Body() dto: AdminSendPreviewTurnDto,
        @Req() req: AuthenticatedRequest,
    ): Promise<ApiResponse<AdminPreviewSessionFacadeDto>> {
        const adminId = req.user.userId;
        const result = await this._sendPreviewTurnUseCase.execute(adminId, sessionId, dto);
        return ApiResponseHelper.success(RESPONSE_MESSAGES.ADMIN.SCENE_PARTNER.PREVIEW_TURN_PROCESSED, result);
    }

    @Patch(API_ENDPOINTS.ADMIN.SCENE_PARTNER.PREVIEW_COACHING)
    @HttpCode(HttpStatus.OK)
    @RequirePermissions(AdminPermission.SCENE_PARTNER_MANAGE)
    async updatePreviewCoachingMode(
        @Param("id") sessionId: string,
        @Body() dto: AdminUpdatePreviewCoachingDto,
        @Req() req: AuthenticatedRequest,
    ): Promise<ApiResponse<AdminPreviewSessionFacadeDto>> {
        const adminId = req.user.userId;
        const result = await this._updatePreviewCoachingUseCase.execute(adminId, sessionId, dto);
        return ApiResponseHelper.success(RESPONSE_MESSAGES.ADMIN.SCENE_PARTNER.PREVIEW_COACHING_UPDATED, result);
    }
}
