import { BadGatewayException, Controller, Get, Headers, HttpCode, HttpStatus, Inject, Param, Post, Req, Res, UseGuards } from "@nestjs/common";
import { ITokenPayload, type ITokenservice, TOKEN_SERVICE } from "../../../../shared/domain/interfaces/token-service.interface";
import { HANDOFF_SERVICE, type IHandoffSessionService } from "../../application/interfaces/handoff-service.interface";
import { JwtAuthGuard } from "../../../../shared/infrastructure/security/guards/jwt-auth.guard";
import { type Response } from "express";
import { type IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { GENERATE_HANDOFF_SESSION_USE_CASE, GenerateHandoffResult, IGenerateHandoffSessionUseCase } from "../../application/interfaces/generate-handoff-session.use-case.interface";
import { IValidateHandoffUseCase, VALIDATE_HANDOFF_USE_CASE } from "../../application/interfaces/validate-handoff.interface.use-case";
import { HANDOFF_NOTIFICATION_SERVICE, IHandoffNotificationService } from "../../application/interfaces/handoff-notification.service.interface";
import { AuthenticatedRequest } from "../../../../shared/infrastructure/security/interfaces/authenticated-request.interface";
import { API_ENDPOINTS } from "../../../../shared/domain/constants/api-endpoints.constant";
import { ApiResponse } from "../../../../shared/domain/interfaces/api-response.interface";
import { RESPONSE_MESSAGES } from "../../../../shared/domain/constants/response-messages.constant";

@Controller(API_ENDPOINTS.HANDOFF.BASE)
export class HandoffController {
    constructor(
        @Inject(GENERATE_HANDOFF_SESSION_USE_CASE) private readonly _generateSessionUseCase: IGenerateHandoffSessionUseCase,
        @Inject(VALIDATE_HANDOFF_USE_CASE) private readonly _validateHandoffUseCase: IValidateHandoffUseCase,
        @Inject(HANDOFF_NOTIFICATION_SERVICE) private readonly _handoffGateway: IHandoffNotificationService,
        @Inject(TOKEN_SERVICE) private readonly _tokenService: ITokenservice,
        @Inject(HANDOFF_SERVICE) private readonly _handoffService: IHandoffSessionService,
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
    ){}

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
        @Res({passthrough: true}) res: Response
    ): Promise<ApiResponse<{ accessToken: string; status: string }>> {
        const userId = await this._validateHandoffUseCase.execute(sessionId);

        const user = await this._userRepository.findById(userId);
        if(!user){
            throw new BadGatewayException('User associated with this session no longer exists.');
        }

        const tokenPayload: ITokenPayload = {
            userId: user.id as string,
            email: user.email.getValue(),
            role: 'USER'
        };

        const accessToken = await this._tokenService.generateAccessToken(tokenPayload);
        const refreshToken = await this._tokenService.generateRefreshToken(tokenPayload);

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
        this._handoffGateway.notifyDesktop(sessionId, 'COMPLETED');
        await this._handoffService.deleteSession(sessionId);
        
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
        await this._handoffService.deleteSession(sessionId);
        
        return { 
            success: true, 
            message: RESPONSE_MESSAGES.HANDOFF.CANCELLED
        };
    }
}