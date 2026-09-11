import { BadGatewayException, Controller, Get, Headers, HttpCode, HttpStatus, Inject, Param, Post, Req, Res, UseGuards } from "@nestjs/common";
import { ITokenPayload, type ITokenservice, TOKEN_SERVICE } from "../../domain/interfaces/token-service.interface";
import { HANDOFF_SERVICE, type IHandoffSessionService } from "../../application/interfaces/handoff-service.interface";
import { JwtAuthGuard } from "../../../../shared/infrastructure/security/jwt-auth.guard";
import { type Response } from "express";
import { type IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { IGenerateHandoffSessionUseCase } from "../../application/interfaces/generate-handoff-session.use-case.interface";
import { IValidateHandoffUseCase } from "../../application/interfaces/validate-handoff.interface.use-case";
import { IHandoffNotificationService } from "../../application/interfaces/handoff-notification.service.interface";


@Controller('verification/phone-handoff')
export class HandoffController{
    constructor(
        private readonly _generateSessionUseCase: IGenerateHandoffSessionUseCase,
        private readonly _validateHandoffUseCase: IValidateHandoffUseCase,
        private readonly _handoffGateway: IHandoffNotificationService,
        @Inject(TOKEN_SERVICE) private readonly _tokenService: ITokenservice,
        @Inject(HANDOFF_SERVICE) private readonly _handoffService: IHandoffSessionService, 
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository
    ){}

    // Called by the desktop to generate the QR code token.
    // Requires the desktop to already be logged in (JwtAuthGuard)
    @Post('session')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    async generateSession(
        @Req() req: any,
        @Headers('origin') origin: string // Capture the exact URL frontent is currenlty using
    ){
        // req.user is populated by your JwtAuthGuard
        const userId = req.user.userId;
        return await this._generateSessionUseCase.execute(userId, origin);
    }

    // Called by the Mobie Phone after scanning the QR code.
    // This is a public route (no guard) because the phone is not logged in yet.
    @Get(':sessionId')
    async validateMobileSession(
        @Param('sessionId') sessionId: string,
        @Res({passthrough: true}) res: Response
    ){
        //1. Retrives the userId from Redis and notifies the desktop
        const userId = await this._validateHandoffUseCase.execute(sessionId);

        // 2.Fetch the user from MongoDB to contruct the required ITokenPayload
        const user = await this._userRepository.findById(userId);
        if(!user){
            throw new BadGatewayException('User associated with this session is no longer exists.');
        }

        // 3. Construct the payload matching your exact interface
        const tokenPayload: ITokenPayload = {
            userId: user.id as string,
            email: user.email.getValue(),
            role: 'USER'
        }

        // 4. Generate the specific tokens using your defined methods
        const accessToken = await this._tokenService.generateAccessToken(tokenPayload);
        const refreshToken = await this._tokenService.generateRefreshToken(tokenPayload);

        // 5. Set the HttpOnly cookie so the mobile phon enow fully authenticated
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        return {
            success: true,
            data: {
                accessToken: accessToken,
                status: 'PHONE_CONNECTED'
            }

        }
    }

    // Called by the Mobile Phone when the biometric selfie is done
    @Post(':sessionId/complete')
    @UseGuards(JwtAuthGuard) // requires the mobile to be authenticated
    @HttpCode(HttpStatus.OK)
    async completeSession(@Param('sessionId') sessionId: string){
        // Notify desktop to redirect to the next phase
        this._handoffGateway.notifyDesktop(sessionId, 'COMPLETED');

        // Destroy the Redis token so it cannot be reused
        await this._handoffService.deleteSession(sessionId);
        
        return {success: true, message: 'Phone handoff completed successfully'};
    }

    // Called by the Desktop if the user closes the QR modal
    @Post(':sessionId/cancel')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async cancelSession(@Param('sessionId') sessionId: string){
        await this._handoffService.deleteSession(sessionId);
        return {success: true, message: "Session cancelled"};
    }

}