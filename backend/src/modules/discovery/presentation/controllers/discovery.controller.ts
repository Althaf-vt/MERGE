import { Controller, Get, HttpCode, HttpStatus, Inject, Query, Req, UseGuards } from "@nestjs/common";
import { API_ENDPOINTS } from "../../../../shared/presentation/constants/api-endpoints.constant";
import { JwtAuthGuard } from "../../../../shared/infrastructure/security/guards/jwt-auth.guard";
import { UserSessionGuard } from "../../../../shared/infrastructure/security/guards/user-session.guard";
import { GET_RECOMMENDATIONS_USE_CASE, IGetRecommendationsUseCase } from "../../application/interfaces/get-recommendations.use-case.interface";
import { DiscoveryRecommendationDto, GetRecommendationsQueryDto } from "../../application/dtos/discovery.dto";
import { AuthenticatedRequest } from "../../../../shared/infrastructure/security/interfaces/authenticated-request.interface";
import { ApiResponse } from "../../../../shared/presentation/interfaces/api-response.interface";
import { RESPONSE_MESSAGES } from "../../../../shared/presentation/constants/response-messages.constant";

@Controller(API_ENDPOINTS.DISCOVERY.BASE)
@UseGuards(JwtAuthGuard, UserSessionGuard)
export class DiscoveryController{
    constructor(
        @Inject(GET_RECOMMENDATIONS_USE_CASE) private readonly _getRecommendationsUseCase: IGetRecommendationsUseCase,
    ){}

    @Get(API_ENDPOINTS.DISCOVERY.RECOMMENDATIONS)
    @HttpCode(HttpStatus.OK)
    async getRecommendation(
        @Query() query: GetRecommendationsQueryDto,
        @Req() req: AuthenticatedRequest
    ): Promise<ApiResponse<DiscoveryRecommendationDto[]>>{
        const result = await this._getRecommendationsUseCase.execute(req.user.userId, query);

        return {
            success: true,
            message: RESPONSE_MESSAGES.DISCOVERY.RECOMMENDATIONS_FETCHED,
            data: result.data,
            meta: {
                total: result.total,
                page: result.page,
                limit: result.limit
            }
        };
    }
}