import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { API_ENDPOINTS } from "../../../../shared/presentation/constants/api-endpoints.constant";
import { RESPONSE_MESSAGES } from "../../../../shared/presentation/constants/response-messages.constant";
import { ApiResponse } from "../../../../shared/presentation/interfaces/api-response.interface";
import { JwtAuthGuard } from "../../../../shared/infrastructure/security/guards/jwt-auth.guard";
import { UserSessionGuard } from "../../../../shared/infrastructure/security/guards/user-session.guard";
import { AuthenticatedRequest } from "../../../../shared/infrastructure/security/interfaces/authenticated-request.interface";
import { AddToPrivateListDto, GetPrivateListQueryDto, PrivateListResponseDto } from "../../application/dtos/private-list.dto";
import { ADD_TO_PRIVATE_LIST_USE_CASE, GET_PRIVATE_LIST_USE_CASE, IAddToPrivateListUseCase, IGetPrivateListUseCase, IRemoveFromPrivateListUseCase, REMOVE_FROM_PRIVATE_LIST_USE_CASE } from "../../application/interfaces/private-list.use-cases.interface";

@Controller(API_ENDPOINTS.PRIVATE_LISTS.BASE)
@UseGuards(JwtAuthGuard, UserSessionGuard)
export class PrivateListsController {
    constructor(
        @Inject(GET_PRIVATE_LIST_USE_CASE) private readonly _getListUseCase: IGetPrivateListUseCase,
        @Inject(ADD_TO_PRIVATE_LIST_USE_CASE) private readonly _addToListUseCase: IAddToPrivateListUseCase,
        @Inject(REMOVE_FROM_PRIVATE_LIST_USE_CASE) private readonly _removeFromListUseCase: IRemoveFromPrivateListUseCase,
    ) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    async getPrivateList(
        @Req() req: AuthenticatedRequest,
        @Query() query: GetPrivateListQueryDto
    ): Promise<ApiResponse<PrivateListResponseDto[]>> {
        const result = await this._getListUseCase.execute(req.user.userId, query);
        
        return { 
            success: true, 
            data: result.data,
            meta: { total: result.total, page: result.page, limit: result.limit }
        };
    }

    @Post(API_ENDPOINTS.PRIVATE_LISTS.ADD)
    @HttpCode(HttpStatus.OK)
    async addToList(
        @Req() req: AuthenticatedRequest, 
        @Body() dto: AddToPrivateListDto
    ): Promise<ApiResponse> {
        await this._addToListUseCase.execute(req.user.userId, dto);
        return { success: true, message: RESPONSE_MESSAGES.PRIVATE_LISTS.ADDED };
    }

    @Delete(API_ENDPOINTS.PRIVATE_LISTS.REMOVE)
    @HttpCode(HttpStatus.OK)
    async removeFromList(@Req() req: AuthenticatedRequest, @Param('id') targetUserId: string): Promise<ApiResponse> {
        await this._removeFromListUseCase.execute(req.user.userId, targetUserId);
        return { success: true, message: RESPONSE_MESSAGES.PRIVATE_LISTS.REMOVED };
    }
}