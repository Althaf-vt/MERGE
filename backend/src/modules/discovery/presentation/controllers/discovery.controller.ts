import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Query, Req, UseGuards } from "@nestjs/common";
import { API_ENDPOINTS } from "../../../../shared/presentation/constants/api-endpoints.constant";
import { JwtAuthGuard } from "../../../../shared/infrastructure/security/guards/jwt-auth.guard";
import { UserSessionGuard } from "../../../../shared/infrastructure/security/guards/user-session.guard";
import { GET_RECOMMENDATIONS_USE_CASE, IGetRecommendationsUseCase } from "../../application/interfaces/get-recommendations.use-case.interface";
import { PASS_CANDIDATE_USE_CASE, IPassCandidateUseCase } from "../../application/interfaces/pass-candidate.use-case.interface";
import { DiscoveryRecommendationDto, GetRecommendationsQueryDto, PassCandidateDto } from "../../application/dtos/discovery.dto";
import { AuthenticatedRequest } from "../../../../shared/infrastructure/security/interfaces/authenticated-request.interface";
import { ApiResponse } from "../../../../shared/presentation/interfaces/api-response.interface";
import { RESPONSE_MESSAGES } from "../../../../shared/presentation/constants/response-messages.constant";

@Controller(API_ENDPOINTS.DISCOVERY.BASE)
@UseGuards(JwtAuthGuard, UserSessionGuard)
export class DiscoveryController {
    constructor(
        @Inject(GET_RECOMMENDATIONS_USE_CASE) private readonly _getRecommendationsUseCase: IGetRecommendationsUseCase,
        @Inject(PASS_CANDIDATE_USE_CASE) private readonly _passCandidateUseCase: IPassCandidateUseCase,
    ) { }

    @Get(API_ENDPOINTS.DISCOVERY.RECOMMENDATIONS)
    @HttpCode(HttpStatus.OK)
    async getRecommendation(
        @Query() query: GetRecommendationsQueryDto,
        @Req() req: AuthenticatedRequest
    ): Promise<ApiResponse<DiscoveryRecommendationDto[]>> {
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

    @Post(API_ENDPOINTS.DISCOVERY.PASS)
    @HttpCode(HttpStatus.OK)
    async passCandidate(
        @Body() dto: PassCandidateDto,
        @Req() req: AuthenticatedRequest
    ): Promise<ApiResponse<void>> {
        await this._passCandidateUseCase.execute(req.user.userId, dto);

        return {
            success: true,
            message: RESPONSE_MESSAGES.DISCOVERY.CANDIDATE_PASSED,
        };
    }
}