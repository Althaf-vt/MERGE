import { Body, Controller, Delete, HttpCode, HttpStatus, Inject, Param, Post, Req, UseGuards } from "@nestjs/common";
import { API_ENDPOINTS } from "../../../../shared/presentation/constants/api-endpoints.constant";
import { RESPONSE_MESSAGES } from "../../../../shared/presentation/constants/response-messages.constant";
import { ApiResponse } from "../../../../shared/presentation/interfaces/api-response.interface";
import { JwtAuthGuard } from "../../../../shared/infrastructure/security/guards/jwt-auth.guard";
import { UserSessionGuard } from "../../../../shared/infrastructure/security/guards/user-session.guard";
import { AuthenticatedRequest } from "../../../../shared/infrastructure/security/interfaces/authenticated-request.interface";
import { AddToPrivateListDto } from "../../application/dtos/connection.dto";
import { 
    ADD_TO_PRIVATE_LIST_USE_CASE, 
    IAddToPrivateListUseCase, 
    IRemoveFromPrivateListUseCase, 
    REMOVE_FROM_PRIVATE_LIST_USE_CASE 
} from "../../application/interfaces/private-list.use-cases.interface";

@Controller(API_ENDPOINTS.PRIVATE_LISTS.BASE)
@UseGuards(JwtAuthGuard, UserSessionGuard)
export class PrivateListsController {
    constructor(
        @Inject(ADD_TO_PRIVATE_LIST_USE_CASE) private readonly _addToListUseCase: IAddToPrivateListUseCase,
        @Inject(REMOVE_FROM_PRIVATE_LIST_USE_CASE) private readonly _removeFromListUseCase: IRemoveFromPrivateListUseCase,
    ) {}

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