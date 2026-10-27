import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../../shared/infrastructure/security/guards/jwt-auth.guard";
import { UserSessionGuard } from "../../../../shared/infrastructure/security/guards/user-session.guard";
import { BLOCK_USER_USE_CASE, GET_BLOCKED_USERS_USE_CASE, IBlockUserUseCase, IGetBlockedUsersUseCase, IUnblockUserUseCase, UNBLOCK_USER_USE_CASE } from "../../application/interfaces/block-management.use-case.interface";
import { BlockedUserResponseDto, BlockUserDto, GetBlockedUsersQueryDto } from "../../application/dtos/block-management.dto";
import { AuthenticatedRequest } from "../../../../shared/infrastructure/security/interfaces/authenticated-request.interface";
import { API_ENDPOINTS } from "../../../../shared/presentation/constants/api-endpoints.constant";
import { ApiResponse } from "../../../../shared/presentation/interfaces/api-response.interface";
import { RESPONSE_MESSAGES } from "../../../../shared/presentation/constants/response-messages.constant";

@Controller(API_ENDPOINTS.BLOCKED_USERS.BASE)
@UseGuards(JwtAuthGuard, UserSessionGuard)
export class BlockedUsersController {
    constructor(
        @Inject(BLOCK_USER_USE_CASE) private readonly _blockUserUseCase: IBlockUserUseCase,
        @Inject(UNBLOCK_USER_USE_CASE) private readonly _unblockUserUseCase: IUnblockUserUseCase,
        @Inject(GET_BLOCKED_USERS_USE_CASE) private readonly _getBlockedUsersUseCase: IGetBlockedUsersUseCase,
    ) { }

    @Get(API_ENDPOINTS.BLOCKED_USERS.BLOCKED)
    @HttpCode(HttpStatus.OK)
    async getBlockedUsers(
        @Req() req: AuthenticatedRequest,
        @Query() query: GetBlockedUsersQueryDto
    ): Promise<ApiResponse<BlockedUserResponseDto[]>> {
        const data = await this._getBlockedUsersUseCase.execute(req.user.userId, query.search, query.sortBy);
        return {
            success: true,
            data
        };
    }

    @Post(API_ENDPOINTS.BLOCKED_USERS.BLOCKED)
    @HttpCode(HttpStatus.OK)
    async blockUser(
        @Req() req: AuthenticatedRequest,
        @Body() dto: BlockUserDto
    ): Promise<ApiResponse<undefined>> {
        await this._blockUserUseCase.execute(req.user.userId, dto);
        return {
            success: true,
            message: RESPONSE_MESSAGES.PROFILE.USER_BLOCKED || 'Profile blocked successfully.'
        };
    }

    @Delete(API_ENDPOINTS.BLOCKED_USERS.BLOCKED_BY_ID)
    @HttpCode(HttpStatus.OK)
    async unblockUser(
        @Req() req: AuthenticatedRequest,
        @Param('blockedId') blockedId: string
    ): Promise<ApiResponse<undefined>> {
        await this._unblockUserUseCase.execute(req.user.userId, blockedId);
        return {
            success: true,
            message: RESPONSE_MESSAGES.PROFILE.USER_UNBLOCKED
        };
    }
}