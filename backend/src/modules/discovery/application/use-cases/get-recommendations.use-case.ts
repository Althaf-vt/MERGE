import { Inject, Injectable } from "@nestjs/common";
import { IGetRecommendationsUseCase } from "../interfaces/get-recommendations.use-case.interface";
import { DISCOVERY_REPOSITORY, IDiscoveryRepository } from "../../domain/interfaces/discovery-repository.interface";
import { GetRecommendationsQueryDto, PaginatedRecommendationsDto } from "../dtos/discovery.dto";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { IMediaFacade, MEDIA_FACADE } from "../../../users/application/interfaces/media-facade.interface";
import { CONNECTIONS_FACADE, IConnectionsFacade } from "../../../connections/application/interfaces/connections-facade.interface";
import { DISCOVERY_CONSTANTS } from "../../domain/constants/discovery.constants";
import { DiscoveryRecommendationMapper } from "../mappers/discovery-recommendation.mapper";

@Injectable()
export class GetRecommendationsUseCase implements IGetRecommendationsUseCase {
    constructor(
        @Inject(DISCOVERY_REPOSITORY) private readonly _repository: IDiscoveryRepository,
        @Inject(MEDIA_FACADE) private readonly _userMediaFacade: IMediaFacade,
        @Inject(CONNECTIONS_FACADE) private readonly _connectionsFacade: IConnectionsFacade,
    ) { }

    async execute(userId: string, query: GetRecommendationsQueryDto): Promise<PaginatedRecommendationsDto> {
        const [userContext, interactedIds] = await Promise.all([
            this._repository.getUserSearchContext(userId),
            this._connectionsFacade.getInteractedUserIds(userId),
        ]);

        if (!userContext?.personalityVector || userContext.personalityVector.length !== DISCOVERY_CONSTANTS.PERSONALITY_VECTOR_DIMENSIONS) {
            throw new DomainException(
                ErrorCode.VALIDATION_FAILED,
                'Personality vector missing or invalid. Please complete the Casting Director interview.'
            );
        }

        const page = query.page ?? DISCOVERY_CONSTANTS.DEFAULT_PAGE;
        const limit = query.limit ?? DISCOVERY_CONSTANTS.DEFAULT_LIMIT;
        const skip = (page - 1) * limit;

        // Resolve global search intent: Either explicitly requested in query, or enabled via user preferences
        const isGlobal = query.isGlobal ?? (userContext.preference?.immigrationReady === true);

        // Exclude current user and all interacted profiles (connections, private lists, priority intros)
        const excludedIds = Array.from(new Set([userId, ...interactedIds]));

        const rawCandidates = await this._repository.findVectorMatches({
            userContext,
            isGlobal,
            excludedIds,
            limit,
            skip,
        });

        const hydratedCandidates = await Promise.all(
            rawCandidates.map(candidate =>
                DiscoveryRecommendationMapper.toRecommendationDto(candidate, userContext, this._userMediaFacade)
            )
        );

        return {
            data: hydratedCandidates,
            total: hydratedCandidates.length, // Vector search post-filtered count
            page,
            limit,
        };
    }
}