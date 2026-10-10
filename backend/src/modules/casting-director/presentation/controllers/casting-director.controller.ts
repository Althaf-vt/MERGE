import { Body, Controller, HttpCode, HttpStatus, Inject, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../../shared/infrastructure/security/guards/jwt-auth.guard";
import { IInitializeCastingSessionUseCase, INITIALIZE_CASTING_SESSION_USE_CASE } from "../../application/interfaces/initialize-casting-session.use-case.interface";
import { IProcessCastingMessageUseCase, PROCESS_CASTING_MESSAGE_USE_CASE } from "../../application/interfaces/process-casting-message.use-case.interface";
import { FINALIZE_CASTING_SESSION_USE_CASE, IFinalizeCastingSessionUseCase } from "../../application/interfaces/finalize-casting-session.use-case.interface";
import { ProcessMessageDto } from "../../application/dtos/process-message.dto";
import { UserSessionGuard } from "../../../../shared/infrastructure/security/guards/user-session.guard";
import { API_ENDPOINTS } from "../../../../shared/domain/constants/api-endpoints.constant";
import { ApiResponse } from "../../../../shared/domain/interfaces/api-response.interface";
import { RESPONSE_MESSAGES } from "../../../../shared/domain/constants/response-messages.constant";
import { AuthenticatedRequest } from "../../../../shared/infrastructure/security/interfaces/authenticated-request.interface";

@Controller(API_ENDPOINTS.CASTING_DIRECTOR.BASE)
@UseGuards(JwtAuthGuard, UserSessionGuard)
export class CastingDirectorController {
    constructor(
        @Inject(INITIALIZE_CASTING_SESSION_USE_CASE) private readonly _initializeCastingSessionUseCase: IInitializeCastingSessionUseCase,
        @Inject(PROCESS_CASTING_MESSAGE_USE_CASE) private readonly _processCastingMessageUseCase: IProcessCastingMessageUseCase,
        @Inject(FINALIZE_CASTING_SESSION_USE_CASE) private readonly _finalizeCastingSessionUseCase: IFinalizeCastingSessionUseCase
    ) { }

    @Post(API_ENDPOINTS.CASTING_DIRECTOR.INITIALIZE)
    @HttpCode(HttpStatus.OK)
    async initialize(@Req() req: AuthenticatedRequest): Promise<ApiResponse<Record<string, unknown>>> {
        const session = await this._initializeCastingSessionUseCase.execute(req.user.userId);
        return {
            success: true,
            message: RESPONSE_MESSAGES.CASTING_DIRECTOR.SESSION_INITIALIZED,
            data: session.toJSON()
        };
    }

    @Post(API_ENDPOINTS.CASTING_DIRECTOR.MESSAGE)
    @HttpCode(HttpStatus.OK)
    async processMessage(
        @Req() req: AuthenticatedRequest, 
        @Body() dto: ProcessMessageDto
    ): Promise<ApiResponse<Record<string, unknown>>> {
        const session = await this._processCastingMessageUseCase.execute(req.user.userId, dto.content);
        return {
            success: true,
            message: RESPONSE_MESSAGES.CASTING_DIRECTOR.MESSAGE_PROCESSED,
            data: session.toJSON(),
        };
    }

    @Post(API_ENDPOINTS.CASTING_DIRECTOR.FINALIZE)
    @HttpCode(HttpStatus.OK)
    async finalize(@Req() req: AuthenticatedRequest): Promise<ApiResponse<undefined>> {
        await this._finalizeCastingSessionUseCase.execute(req.user.userId);
        return {
            success: true,
            message: RESPONSE_MESSAGES.CASTING_DIRECTOR.SESSION_FINALIZED
        };
    }
}