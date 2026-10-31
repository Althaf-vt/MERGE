import { Body, Controller, HttpCode, HttpStatus, Inject, Param, Post, Req, UseGuards } from "@nestjs/common";
import { API_ENDPOINTS } from "../../../../shared/presentation/constants/api-endpoints.constant";
import { RESPONSE_MESSAGES } from "../../../../shared/presentation/constants/response-messages.constant";
import { ApiResponse } from "../../../../shared/presentation/interfaces/api-response.interface";
import { JwtAuthGuard } from "../../../../shared/infrastructure/security/guards/jwt-auth.guard";
import { UserSessionGuard } from "../../../../shared/infrastructure/security/guards/user-session.guard";
import { AuthenticatedRequest } from "../../../../shared/infrastructure/security/interfaces/authenticated-request.interface";
import { SendPriorityIntroDto, TargetUserDto } from "../../application/dtos/connection.dto";
import { ACCEPT_CONNECTION_USE_CASE, CANCEL_CONNECTION_USE_CASE, DECLINE_CONNECTION_USE_CASE, IAcceptConnectionUseCase, ICancelConnectionUseCase, IDeclineConnectionUseCase, IRevokeMatchUseCase, ISendConnectionRequestUseCase, ISendPriorityIntroUseCase, REVOKE_MATCH_USE_CASE, SEND_CONNECTION_REQUEST_USE_CASE, SEND_PRIORITY_INTRO_USE_CASE } from "../../application/interfaces/connection.use-cases.interface";

@Controller(API_ENDPOINTS.CONNECTIONS.BASE)
@UseGuards(JwtAuthGuard, UserSessionGuard)
export class ConnectionsController {
    constructor(
        @Inject(SEND_CONNECTION_REQUEST_USE_CASE) private readonly _sendRequestUseCase: ISendConnectionRequestUseCase,
        @Inject(SEND_PRIORITY_INTRO_USE_CASE) private readonly _sendPriorityIntroUseCase: ISendPriorityIntroUseCase,
        @Inject(ACCEPT_CONNECTION_USE_CASE) private readonly _acceptRequestUseCase: IAcceptConnectionUseCase,
        @Inject(DECLINE_CONNECTION_USE_CASE) private readonly _declineRequestUseCase: IDeclineConnectionUseCase,
        @Inject(CANCEL_CONNECTION_USE_CASE) private readonly _cancelRequestUseCase: ICancelConnectionUseCase,
        @Inject(REVOKE_MATCH_USE_CASE) private readonly _revokeMatchUseCase: IRevokeMatchUseCase,
    ) {}

    @Post(API_ENDPOINTS.CONNECTIONS.REQUEST)
    @HttpCode(HttpStatus.OK)
    async sendRequest(@Req() req: AuthenticatedRequest, @Body() dto: TargetUserDto): Promise<ApiResponse> {
        await this._sendRequestUseCase.execute(req.user.userId, dto);
        return { success: true, message: RESPONSE_MESSAGES.CONNECTIONS.REQUEST_SENT };
    }

    @Post(API_ENDPOINTS.CONNECTIONS.PRIORITY_INTRO)
    @HttpCode(HttpStatus.OK)
    async sendPriorityIntro(@Req() req: AuthenticatedRequest, @Body() dto: SendPriorityIntroDto): Promise<ApiResponse> {
        await this._sendPriorityIntroUseCase.execute(req.user.userId, dto);
        return { success: true, message: RESPONSE_MESSAGES.CONNECTIONS.PRIORITY_INTRO_SENT };
    }

    @Post(API_ENDPOINTS.CONNECTIONS.ACCEPT)
    @HttpCode(HttpStatus.OK)
    async acceptRequest(@Req() req: AuthenticatedRequest, @Param('id') connectionId: string): Promise<ApiResponse> {
        await this._acceptRequestUseCase.execute(req.user.userId, connectionId);
        return { success: true, message: RESPONSE_MESSAGES.CONNECTIONS.ACCEPTED };
    }

    @Post(API_ENDPOINTS.CONNECTIONS.DECLINE)
    @HttpCode(HttpStatus.OK)
    async declineRequest(@Req() req: AuthenticatedRequest, @Param('id') connectionId: string): Promise<ApiResponse> {
        await this._declineRequestUseCase.execute(req.user.userId, connectionId);
        return { success: true, message: RESPONSE_MESSAGES.CONNECTIONS.DECLINED };
    }

    @Post(API_ENDPOINTS.CONNECTIONS.CANCEL)
    @HttpCode(HttpStatus.OK)
    async cancelRequest(@Req() req: AuthenticatedRequest, @Param('id') connectionId: string): Promise<ApiResponse> {
        await this._cancelRequestUseCase.execute(req.user.userId, connectionId);
        return { success: true, message: RESPONSE_MESSAGES.CONNECTIONS.CANCELLED };
    }

    @Post(API_ENDPOINTS.CONNECTIONS.REVOKE)
    @HttpCode(HttpStatus.OK)
    async revokeMatch(@Req() req: AuthenticatedRequest, @Param('id') connectionId: string): Promise<ApiResponse> {
        await this._revokeMatchUseCase.execute(req.user.userId, connectionId);
        return { success: true, message: RESPONSE_MESSAGES.CONNECTIONS.REVOKED };
    }
}