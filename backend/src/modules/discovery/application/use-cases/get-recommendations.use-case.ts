import { Inject, Injectable } from "@nestjs/common";
import { IGetRecommendationsUseCase } from "../interfaces/get-recommendations.use-case.interface";
import { DISCOVERY_REPOSITORY, IDiscoveryRepository } from "../../domain/interfaces/discovery-repository.interface";
import { IUserManagementFacade, USER_MANAGEMENT_FACADE } from "../../../users/application/interfaces/user-management-facade.interface";
import { DiscoveryRecommendationDto, GetRecommendationsQueryDto, PaginatedRecommendationsDto } from "../dtos/discovery.dto";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { Types } from "mongoose";
import { GeoUtil } from "../../../../shared/domain/utils/geo.util";
import { IMediaFacade, MEDIA_FACADE } from "../../../users/application/interfaces/media-facade.interface";

@Injectable()
export class GetRecommendationsUseCase implements IGetRecommendationsUseCase{
    constructor(
        @Inject(DISCOVERY_REPOSITORY) private readonly _repository: IDiscoveryRepository,
        @Inject(USER_MANAGEMENT_FACADE) private readonly _userFacade: IUserManagementFacade,
        @Inject(MEDIA_FACADE) private readonly _userMediaFacade: IMediaFacade,
    ){}

    async execute(userId: string, query: GetRecommendationsQueryDto): Promise<PaginatedRecommendationsDto> {
        const userContext = await this._repository.getUserSearchContext(userId);

        if(!userContext || !userContext.personalityVector || userContext.personalityVector.length !== 1536){
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Personality vector missing or invalid. Please complete the Casting Director interview.');
        }

        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const skip = (page - 1) * limit;

        // Resolve global search intent: Either explicitly requested n query, or enable via user prefernces
        const isGlobal = query.isGlobal ?? (userContext.preference?.immigrationReady === true);

        // Fetch excluded IDs (eg. users already passed/shortlisted/blocked) - Mocked as self for now
        const excludedIds = [new Types.ObjectId(userId)]

        const rawCandidates = await this._repository.findVectorMatches({
            userContext,
            isGlobal,
            excludedIds,
            limit,
            skip,
        });

        const hydratedCandidates: DiscoveryRecommendationDto[] = await Promise.all(
            rawCandidates.map(async (candidate) => {
                // 1. Haversine Distance mapping
                const distanceKm = GeoUtil.calculateHaversineDistanceKm(
                    userContext.location.coordinates[0], userContext.location.coordinates[1],
                    candidate.location.coordinates[0], candidate.location.coordinates[1]
                );

                // 2. Safe Age Calculation from immutable verified DOB
                let calculatedAge: number | null = null;
                const dob = candidate.kycVerification.verifiedDOB as string | Date;
                if(dob){
                    const diff = Date.now() - new Date(dob).getTime();
                    calculatedAge = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
                }

                // 3. Hydrate S3 keys to presigned URLs via Facade
                const primaryPhoto = (candidate.photos as any[])?.find(p => p.isPrimary) || (candidate.photos as any[])?.[0];
                const primaryPhotoUrl = primaryPhoto?.url
                    ? await this._userMediaFacade.getPresignedMediaUrl(primaryPhoto.url, 3600)
                    : null;

                return {
                    id: String(candidate._id),
                    displayName: candidate.profile?.displayName as string || 'Unknown',
                    customLabel: candidate.profile?.customLabel as string | undefined,
                    bio: candidate.profile?.bio as string || '',
                    age: calculatedAge,
                    city: candidate.profile?.city as string || 'Unknown',
                    state: candidate.profile?.state as string || 'Unknown',
                    country: candidate.profile?.country as string || 'Unknown',
                    distanceKm,
                    matchScore: Number((candidate.matchScore * 100).toFixed(1)), // Convert raw cosine to percentage
                    primaryPhotoUrl
                };
            })
        );

        return {
            data: hydratedCandidates,
            total: hydratedCandidates.length, // Placeholder: Vector search doesn't easily return absolute totals with post-filtering
            page,
            limit,
        }
    }
}