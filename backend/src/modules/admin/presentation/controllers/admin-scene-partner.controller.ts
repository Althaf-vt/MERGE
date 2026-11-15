import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
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
import { AdminPreviewSessionFacadeDto, AdminScenarioFacadeDto, AdminSessionDetailFacadeDto, AdminSessionListItemFacadeDto, IScenePartnerAdminFacade, SCENE_PARTNER_ADMIN_FACADE, ScenePartnerAnalyticsFacadeDto } from "../../../scene-partner/application/interfaces/scene-partner-admin-facade.interface";
import { AdminCreateScenarioDto, AdminGetScenariosQueryDto, AdminGetSessionsQueryDto, AdminSendPreviewTurnDto, AdminStartPreviewDto, AdminToggleScenarioStatusDto, AdminUpdateScenarioDto } from "../../application/dtos/admin-scene-partner.dto";
import { AdminAuditAction, AdminAuditResourceType } from "../../domain/enums/admin-audit.enums";
import { IRecordAdminAuditLogUseCase, RECORD_ADMIN_AUDIT_LOG_USE_CASE } from "../../application/interfaces/admin-audit.use-cases.interface";

@Controller(API_ENDPOINTS.ADMIN.SCENE_PARTNER.BASE)
@UseGuards(JwtAuthGuard, AdminSessionGuard, AdminPermissionsGuard)
export class AdminScenePartnerController {
    constructor(
        @Inject(SCENE_PARTNER_ADMIN_FACADE) private readonly _scenePartnerAdminFacade: IScenePartnerAdminFacade,
        @Inject(RECORD_ADMIN_AUDIT_LOG_USE_CASE) private readonly _recordAdminAuditLogUseCase: IRecordAdminAuditLogUseCase,
    ) { }

    @Post(API_ENDPOINTS.ADMIN.SCENE_PARTNER.SCENARIOS)
    @HttpCode(HttpStatus.CREATED)
    @RequirePermissions(AdminPermission.SCENE_PARTNER_MANAGE)
    async createScenario(
        @Body() dto: AdminCreateScenarioDto,
        @Req() req: AuthenticatedRequest,
    ): Promise<ApiResponse<AdminScenarioFacadeDto>> {
        const result = await this._scenePartnerAdminFacade.createScenario(dto);

        await this._recordAdminAuditLogUseCase.execute({
            adminId: req.user.userId,
            adminEmail: req.user.email,
            action: AdminAuditAction.SCENARIO_CREATED,
            resourceType: AdminAuditResourceType.SCENARIO,
            resourceId: result.id,
            details: {
                title: result.title,
                category: result.category,
                isActive: result.isActive,
            },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'] as string | undefined,
        });

        return ApiResponseHelper.success(RESPONSE_MESSAGES.ADMIN.SCENE_PARTNER.SCENARIO_CREATED, result);
    }

    @Get(API_ENDPOINTS.ADMIN.SCENE_PARTNER.SCENARIOS)
    @HttpCode(HttpStatus.OK)
    @RequirePermissions(AdminPermission.SCENE_PARTNER_MANAGE)
    async getScenarios(
        @Query() query: AdminGetScenariosQueryDto,
    ): Promise<ApiResponse<AdminScenarioFacadeDto[]>> {
        const result = await this._scenePartnerAdminFacade.getScenarios(query);
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

    @Get(API_ENDPOINTS.ADMIN.SCENE_PARTNER.ANALYTICS)
    @HttpCode(HttpStatus.OK)
    @RequirePermissions(AdminPermission.SCENE_PARTNER_MANAGE)
    async getAnalytics(): Promise<ApiResponse<ScenePartnerAnalyticsFacadeDto>> {
        const result = await this._scenePartnerAdminFacade.getAnalytics();
        return ApiResponseHelper.success(RESPONSE_MESSAGES.ADMIN.SCENE_PARTNER.ANALYTICS_FETCHED, result);
    }

    @Get(API_ENDPOINTS.ADMIN.SCENE_PARTNER.SESSIONS)
    @HttpCode(HttpStatus.OK)
    @RequirePermissions(AdminPermission.SCENE_PARTNER_MANAGE)
    async getSessions(
        @Query() query: AdminGetSessionsQueryDto,
    ): Promise<ApiResponse<AdminSessionListItemFacadeDto[]>> {
        const result = await this._scenePartnerAdminFacade.getSessions(query);
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
        const result = await this._scenePartnerAdminFacade.getSessionDetails(id);
        return ApiResponseHelper.success(RESPONSE_MESSAGES.ADMIN.SCENE_PARTNER.SESSION_DETAILS_FETCHED, result);
    }

    @Get(API_ENDPOINTS.ADMIN.SCENE_PARTNER.SCENARIO_BY_ID)
    @HttpCode(HttpStatus.OK)
    @RequirePermissions(AdminPermission.SCENE_PARTNER_MANAGE)
    async getScenarioById(
        @Param("id") id: string,
    ): Promise<ApiResponse<AdminScenarioFacadeDto>> {
        const result = await this._scenePartnerAdminFacade.getScenarioById(id);
        return ApiResponseHelper.success(RESPONSE_MESSAGES.ADMIN.SCENE_PARTNER.SCENARIO_FETCHED, result);
    }

    @Patch(API_ENDPOINTS.ADMIN.SCENE_PARTNER.SCENARIO_STATUS)
    @HttpCode(HttpStatus.OK)
    @RequirePermissions(AdminPermission.SCENE_PARTNER_MANAGE)
    async toggleScenarioStatus(
        @Param("id") id: string,
        @Body() dto: AdminToggleScenarioStatusDto,
        @Req() req: AuthenticatedRequest,
    ): Promise<ApiResponse<AdminScenarioFacadeDto>> {
        const result = await this._scenePartnerAdminFacade.toggleScenarioStatus(id, dto);

        await this._recordAdminAuditLogUseCase.execute({
            adminId: req.user.userId,
            adminEmail: req.user.email,
            action: result.isActive ? AdminAuditAction.STATUS_ACTIVATED : AdminAuditAction.STATUS_DEACTIVATED,
            resourceType: AdminAuditResourceType.SCENARIO,
            resourceId: result.id,
            details: {
                title: result.title,
                isActive: result.isActive,
            },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'] as string | undefined,
        });

        return ApiResponseHelper.success(RESPONSE_MESSAGES.ADMIN.SCENE_PARTNER.SCENARIO_STATUS_UPDATED, result);
    }

    @Patch(API_ENDPOINTS.ADMIN.SCENE_PARTNER.SCENARIO_BY_ID)
    @HttpCode(HttpStatus.OK)
    @RequirePermissions(AdminPermission.SCENE_PARTNER_MANAGE)
    async updateScenario(
        @Param("id") id: string,
        @Body() dto: AdminUpdateScenarioDto,
        @Req() req: AuthenticatedRequest,
    ): Promise<ApiResponse<AdminScenarioFacadeDto>> {
        const result = await this._scenePartnerAdminFacade.updateScenario(id, dto);

        await this._recordAdminAuditLogUseCase.execute({
            adminId: req.user.userId,
            adminEmail: req.user.email,
            action: AdminAuditAction.SCENARIO_UPDATED,
            resourceType: AdminAuditResourceType.SCENARIO,
            resourceId: result.id,
            details: {
                title: result.title,
                category: result.category,
                updatedFields: Object.keys(dto),
            },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'] as string | undefined,
        });

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
        const result = await this._scenePartnerAdminFacade.startPreviewSession(adminId, dto);
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
        const result = await this._scenePartnerAdminFacade.startPreviewSession(adminId, {
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
        const result = await this._scenePartnerAdminFacade.sendPreviewTurn(adminId, sessionId, dto);
        return ApiResponseHelper.success(RESPONSE_MESSAGES.ADMIN.SCENE_PARTNER.PREVIEW_TURN_PROCESSED, result);
    }
}
