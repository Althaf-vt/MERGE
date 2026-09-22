import { Body, Controller, HttpCode, HttpStatus, Inject, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../../shared/infrastructure/security/guards/jwt-auth.guard";
import { IInitializeCastingSessionUseCase, INITIALIZE_CASTING_SESSION_USE_CASE } from "../../application/interfaces/initialize-casting-session.use-case.interface";
import { IProcessCastingMessageUseCase, PROCESS_CASTING_MESSAGE_USE_CASE } from "../../application/interfaces/process-casting-message.use-case.interface";
import { FINALIZE_CASTING_SESSION_USE_CASE, IFinalizeCastingSessionUseCase } from "../../application/interfaces/finalize-casting-session.use-case.interface";
import { ProcessMessageDto } from "../../application/dtos/process-message.dto";

@Controller('casting-director')
@UseGuards(JwtAuthGuard)
export class CastingDirectorController {
    constructor(
        @Inject(INITIALIZE_CASTING_SESSION_USE_CASE) private readonly _initializeCastingSessionUseCase: IInitializeCastingSessionUseCase,
        @Inject(PROCESS_CASTING_MESSAGE_USE_CASE) private readonly _processCastingMessageUseCase: IProcessCastingMessageUseCase,
        @Inject(FINALIZE_CASTING_SESSION_USE_CASE) private readonly _finalizeCastingSessionUseCase: IFinalizeCastingSessionUseCase
    ) { }

    @Post('initialize')
    @HttpCode(HttpStatus.OK)
    async initialize(@Req() req: any) {
        const session = await this._initializeCastingSessionUseCase.execute(req.user.userId);
        return {
            success: true,
            session: session.toJSON()
        };
    }

    @Post('message')
    @HttpCode(HttpStatus.OK)
    async processMessage(@Req() req: any, @Body() dto: ProcessMessageDto) {
        const session = await this._processCastingMessageUseCase.execute(req.user.userId, dto.content);
        return {
            success: true,
            session: session.toJSON(),
        };
    }

    @Post('finalize')
    @HttpCode(HttpStatus.OK)
    async finalize(@Req() req: any) {
        await this._finalizeCastingSessionUseCase.execute(req.user.userId);
        return {
            success: true,
            message: 'Casting session finalized and personality vector generated.'
        };
    }
}