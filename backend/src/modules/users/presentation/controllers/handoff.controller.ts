import { Controller, Get, Headers, HttpCode, HttpStatus, Inject, Param, Post, Req, Res, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../../shared/infrastructure/security/guards/jwt-auth.guard";
import { type Response } from "express";
import { GENERATE_HANDOFF_SESSION_USE_CASE, GenerateHandoffResult, IGenerateHandoffSessionUseCase } from "../../application/interfaces/generate-handoff-session.use-case.interface";
import { IValidateHandoffUseCase, VALIDATE_HANDOFF_USE_CASE } from "../../application/interfaces/validate-handoff.interface.use-case";
import { COMPLETE_HANDOFF_SESSION_USE_CASE, ICompleteHandoffSessionUseCase } from "../../application/interfaces/complete-handoff-session.use-case.interface";
import { CANCEL_HANDOFF_SESSION_USE_CASE, ICancelHandoffSessionUseCase } from "../../application/interfaces/cancel-handoff-session.use-case.interface";
import { AuthenticatedRequest } from "../../../../shared/infrastructure/security/interfaces/authenticated-request.interface";
import { API_ENDPOINTS } from "../../../../shared/presentation/constants/api-endpoints.constant";
import { ApiResponse } from "../../../../shared/presentation/interfaces/api-response.interface";
import { RESPONSE_MESSAGES } from "../../../../shared/presentation/constants/response-messages.constant";

@Controller(API_ENDPOINTS.HANDOFF.BASE)
export class HandoffController {
    constructor(
        @Inject(GENERATE_HANDOFF_SESSION_USE_CASE) private readonly _generateSessionUseCase: IGenerateHandoffSessionUseCase,
        @Inject(VALIDATE_HANDOFF_USE_CASE) private readonly _validateHandoffUseCase: IValidateHandoffUseCase,
        @Inject(COMPLETE_HANDOFF_SESSION_USE_CASE) private readonly _completeHandoffSessionUseCase: ICompleteHandoffSessionUseCase,
        @Inject(CANCEL_HANDOFF_SESSION_USE_CASE) private readonly _cancelHandoffSessionUseCase: ICancelHandoffSessionUseCase,
    ) { }

    @Post(API_ENDPOINTS.HANDOFF.SESSION)
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    async generateSession(
        @Req() req: AuthenticatedRequest,
        @Headers('origin') origin: string
    ): Promise<ApiResponse<GenerateHandoffResult>> {
        const userId = req.user.userId;
        const data = await this._generateSessionUseCase.execute(userId, origin);

        return {
            success: true,
            message: RESPONSE_MESSAGES.KYC.HANDOFF_CREATED,
            data
        };
    }

    @Get(API_ENDPOINTS.HANDOFF.VALIDATE)
    async validateMobileSession(
        @Param('sessionId') sessionId: string,
        @Res({ passthrough: true }) res: Response
    ): Promise<ApiResponse<{ accessToken: string; status: string }>> {

        const { accessToken, refreshToken } = await this._validateHandoffUseCase.execute(sessionId);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        return {
            success: true,
            message: RESPONSE_MESSAGES.HANDOFF.PHONE_CONNECTED,
            data: {
                accessToken: accessToken,
                status: 'PHONE_CONNECTED'
            }
        };
    }

    @Post(API_ENDPOINTS.HANDOFF.COMPLETE)
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async completeSession(
        @Param('sessionId') sessionId: string
    ): Promise<ApiResponse<undefined>> {
        await this._completeHandoffSessionUseCase.execute(sessionId);

        return {
            success: true,
            message: RESPONSE_MESSAGES.HANDOFF.COMPLETED
        };
    }

    @Post(API_ENDPOINTS.HANDOFF.CANCEL)
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async cancelSession(
        @Param('sessionId') sessionId: string
    ): Promise<ApiResponse<undefined>> {
        await this._cancelHandoffSessionUseCase.execute(sessionId);

        return {
            success: true,
            message: RESPONSE_MESSAGES.HANDOFF.CANCELLED
        };
    }
}