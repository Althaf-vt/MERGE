import { Inject, Injectable } from "@nestjs/common";
import { IGetRecommendationsUseCase } from "../interfaces/get-recommendations.use-case.interface";
import { DISCOVERY_REPOSITORY, IDiscoveryRepository } from "../../domain/interfaces/discovery-repository.interface";
import { DISCOVERY_PASS_REPOSITORY, IDiscoveryPassRepository } from "../../domain/interfaces/discovery-pass-repository.interface";
import { GetRecommendationsQueryDto, PaginatedRecommendationsDto } from "../dtos/discovery.dto";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { IMediaFacade, MEDIA_FACADE } from "../../../users/application/interfaces/media-facade.interface";
import { CONNECTIONS_FACADE, IConnectionsFacade } from "../../../connections/application/interfaces/connections-facade.interface";
import { DISCOVERY_CONSTANTS } from "../../domain/constants/discovery.constants";
import { DISCOVERY_ERROR_MESSAGES } from "../../domain/constants/discovery-error-messages.constant";
import { DiscoveryRecommendationMapper } from "../mappers/discovery-recommendation.mapper";

@Injectable()
export class GetRecommendationsUseCase implements IGetRecommendationsUseCase {
    constructor(
        @Inject(DISCOVERY_REPOSITORY) private readonly _repository: IDiscoveryRepository,
        @Inject(DISCOVERY_PASS_REPOSITORY) private readonly _passRepository: IDiscoveryPassRepository,
        @Inject(MEDIA_FACADE) private readonly _userMediaFacade: IMediaFacade,
        @Inject(CONNECTIONS_FACADE) private readonly _connectionsFacade: IConnectionsFacade,
    ) { }

    async execute(userId: string, query: GetRecommendationsQueryDto): Promise<PaginatedRecommendationsDto> {
        const [userContext, interactedIds, passedUserIds] = await Promise.all([
            this._repository.getUserSearchContext(userId),
            this._connectionsFacade.getInteractedUserIds(userId),
            this._passRepository.getPassedUserIds(userId),
        ]);

        if (!userContext?.personalityVector || userContext.personalityVector.length !== DISCOVERY_CONSTANTS.PERSONALITY_VECTOR_DIMENSIONS) {
            throw new DomainException(
                ErrorCode.VALIDATION_FAILED,
                DISCOVERY_ERROR_MESSAGES.INVALID_PERSONALITY_VECTOR
            );
        }

        const page = query.page ?? DISCOVERY_CONSTANTS.DEFAULT_PAGE;
        const limit = query.limit ?? DISCOVERY_CONSTANTS.DEFAULT_LIMIT;
        const skip = (page - 1) * limit;

        // Resolve global search intent: Either explicitly requested in query, or enabled via user preferences
        const isGlobal = query.isGlobal ?? (userContext.preference?.immigrationReady === true);

        // Exclude current user, interacted profiles (connections, private lists, priority intros), and active passes
        const excludedIds = Array.from(new Set([userId, ...interactedIds, ...passedUserIds]));

        const candidates = await this._repository.findVectorMatches({
            userContext,
            isGlobal,
            excludedIds,
            limit,
            skip,
        });

        return DiscoveryRecommendationMapper.toPaginatedResponseDto(
            candidates,
            page,
            limit,
            userContext,
            this._userMediaFacade,
        );
    }
}