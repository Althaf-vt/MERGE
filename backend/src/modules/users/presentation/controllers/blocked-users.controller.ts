import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../../../shared/infrastructure/security/guards/jwt-auth.guard";
import { UserSessionGuard } from "../../../../shared/infrastructure/security/guards/user-session.guard";
import { BLOCK_USER_USE_CASE, GET_BLOCKED_USERS_USE_CASE, IBlockUserUseCase, IGetBlockedUsersUseCase, IUnblockUserUseCase, UNBLOCK_USER_USE_CASE } from "../../application/interfaces/block-management.use-case.interface";
import { BlockUserDto } from "../../application/dtos/block-management.dto";
import { SortOrder } from "../../domain/enums/user.enums";

@Controller('profile/blocked')
@UseGuards(JwtAuthGuard, UserSessionGuard)
export class BlockedUsersController {
    constructor(
        @Inject(BLOCK_USER_USE_CASE) private readonly _blockUserUseCase: IBlockUserUseCase,
        @Inject(UNBLOCK_USER_USE_CASE) private readonly _unblockUserUseCase: IUnblockUserUseCase,
        @Inject(GET_BLOCKED_USERS_USE_CASE) private readonly _getBlockedUsersUseCase: IGetBlockedUsersUseCase,
    ) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    async getBlockedUsers(
        @Req() req: any,
        @Query('search') search?: string,
        @Query('sortBy') sortBy?: SortOrder
    ) {
        const validSort = Object.values(SortOrder).includes(sortBy as SortOrder) ? sortBy : SortOrder.RECENT;

        const data = await this._getBlockedUsersUseCase.execute(req.user.userId, search, validSort as SortOrder);
        return { success: true, data };
    }

    @Post()
    @HttpCode(HttpStatus.OK)
    async blockUser(@Req() req: any, @Body() dto: BlockUserDto) {
        await this._blockUserUseCase.execute(req.user.userId, dto);
        return { success: true, message: 'Profile blocked successfully. They will no longer be able to see you.' };
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async unblockUser(@Req() req: any, @Param('id') blockedId: string) {
        await this._unblockUserUseCase.execute(req.user.userId, blockedId);
        return { success: true, message: 'Profile unblocked. They may appear in your matching pool again.' };
    }
}