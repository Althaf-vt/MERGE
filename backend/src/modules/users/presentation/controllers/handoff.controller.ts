import { BadGatewayException, Controller, Get, HttpCode, HttpStatus, Inject, Param, Post, Req, Res, UseGuards } from "@nestjs/common";
import { GenerateHandoffSessionUseCase } from "../../application/use-cases/generate-handoff-session.use-case";
import { ValidateHandoffUseCase } from "../../application/use-cases/validate-handoff.use-case";
import { HandoffGateway } from "../gateways/handoff.gateway";
import { ITokenPayload, type ITokenservice, TOKEN_SERVICE } from "../../domain/interfaces/token-service.interface";
import { HANDOFF_SERVICE, type IHandoffSessionService } from "../../domain/interfaces/handoff-service.interface";
import { JwtAuthGuard } from "../../../../shared/infrastructure/security/jwt-auth.guard";
import { type Response } from "express";
import { type IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";


@Controller('verification/phone-handoff')
export class HandoffController{
    constructor(
        private readonly generateSessionUseCase: GenerateHandoffSessionUseCase,
        private readonly validateHandoffUseCase: ValidateHandoffUseCase,
        private readonly handoffGateway: HandoffGateway,
        @Inject(TOKEN_SERVICE) private readonly tokenService: ITokenservice,
        @Inject(HANDOFF_SERVICE) private readonly handoffService: IHandoffSessionService, 
        @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository
    ){}

    // Called by the desktop to generate the QR code token.
    // Requires the desktop to already be logged in (JwtAuthGuard)
    @Post('session')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    async generateSession(@Req() req: any){
        // req.user is populated by your JwtAuthGuard
        const userId = req.user.userId;
        return await this.generateSessionUseCase.execute(userId);
    }

    // Called by the Mobie Phone after scanning the QR code.
    // This is a public route (no guard) because the phone is not logged in yet.
    @Get(':sessionId')
    async validateMobileSession(
        @Param('sessionId') sessionId: string,
        @Res({passthrough: true}) res: Response
    ){
        //1. Retrives the userId from Redis and notifies the desktop
        const userId = await this.validateHandoffUseCase.execute(sessionId);

        // 2.Fetch the user from MongoDB to contruct the required ITokenPayload
        const user = await this.userRepository.findById(userId);
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
        const accessToken = await this.tokenService.generateAccessToken(tokenPayload);
        const refreshToken = await this.tokenService.generateRefreshToken(tokenPayload);

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
        this.handoffGateway.notifyDesktop(sessionId, 'COMPLETED');

        // Destroy the Redis token so it cannot be reused
        await this.handoffService.deleteSession(sessionId);
        
        return {success: true, message: 'Phone handoff completed successfully'};
    }

    // Called by the Desktop if the user closes the QR modal
    @Post(':sessionId/cancel')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async cancelSession(@Param('sessionId') sessionId: string){
        await this.handoffService.deleteSession(sessionId);
        return {success: true, message: "Session cancelled"};
    }

}