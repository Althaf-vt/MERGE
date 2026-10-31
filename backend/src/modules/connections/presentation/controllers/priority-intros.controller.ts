import { Body, Controller, HttpCode, HttpStatus, Inject, Post, Req, UseGuards } from "@nestjs/common";
import { API_ENDPOINTS } from "../../../../shared/presentation/constants/api-endpoints.constant";
import { RESPONSE_MESSAGES } from "../../../../shared/presentation/constants/response-messages.constant";
import { ApiResponse } from "../../../../shared/presentation/interfaces/api-response.interface";
import { JwtAuthGuard } from "../../../../shared/infrastructure/security/guards/jwt-auth.guard";
import { UserSessionGuard } from "../../../../shared/infrastructure/security/guards/user-session.guard";
import { AuthenticatedRequest } from "../../../../shared/infrastructure/security/interfaces/authenticated-request.interface";
import { SendPriorityIntroDto } from "../../application/dtos/priority-intro.dto";
import {
    ISendPriorityIntroUseCase,
    SEND_PRIORITY_INTRO_USE_CASE,
} from "../../application/interfaces/priority-intro.use-cases.interface";

@Controller(API_ENDPOINTS.CONNECTIONS.BASE)
@UseGuards(JwtAuthGuard, UserSessionGuard)
export class PriorityIntrosController {
    constructor(
        @Inject(SEND_PRIORITY_INTRO_USE_CASE) private readonly _sendPriorityIntroUseCase: ISendPriorityIntroUseCase,
    ) {}

    @Post(API_ENDPOINTS.CONNECTIONS.PRIORITY_INTRO)
    @HttpCode(HttpStatus.OK)
    async sendPriorityIntro(
        @Req() req: AuthenticatedRequest,
        @Body() dto: SendPriorityIntroDto
    ): Promise<ApiResponse> {
        await this._sendPriorityIntroUseCase.execute(req.user.userId, dto);
        return { success: true, message: RESPONSE_MESSAGES.CONNECTIONS.PRIORITY_INTRO_SENT };
    }
}