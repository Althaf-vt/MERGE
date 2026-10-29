import { GetRecommendationsQueryDto, PaginatedRecommendationsDto } from "../dtos/discovery.dto";

export const GET_RECOMMENDATIONS_USE_CASE = 'GET_RECOMMENDATIONS_USE_CASE';

export interface IGetRecommendationsUseCase {
    execute(userId: string, query: GetRecommendationsQueryDto): Promise<PaginatedRecommendationsDto>;
}