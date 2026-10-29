import { Injectable } from "@nestjs/common";
import { DiscoveryCandidateRaw, DiscoveryUserContext, IDiscoveryRepository, VectorSearchParams } from "../../domain/interfaces/discovery-repository.interface";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection, Types } from "mongoose";
import { DISCOVERY_CONSTANTS } from "../../domain/constants/discovery.constants";

@Injectable()
export class DiscoveryRepository implements IDiscoveryRepository {
    constructor(@InjectConnection() private readonly _connection: Connection) { }

    async getUserSearchContext(userId: string): Promise<DiscoveryUserContext | null> {
        const user = await this._connection.collection('users').findOne(
            { _id: new Types.ObjectId(userId) },
            { projection: { personalityVector: 1, location: 1, preference: 1 } }
        );
        return user as DiscoveryUserContext | null;
    }

    async findVectorMatches(params: VectorSearchParams): Promise<DiscoveryCandidateRaw[]> {
        const { userContext, isGlobal, excludedIds, limit, skip } = params;
        const collection = this._connection.collection('users');

        // Convert string IDs to ObjectIds within the persistence layer
        const objectIdExcludedIds = (excludedIds || []).map(id => new Types.ObjectId(id));

        // 1. Construct strict base business rules
        const filter: Record<string, unknown> = {
            accountStatus: 'ACTIVE',
            kycCompleted: true,
            _id: { $nin: objectIdExcludedIds },
        };

        // 2. CONDITIONAL GEOSPATIAL BOUNDING
        // If the user is globally minded (immigrationReady) or explicitly requests global, omit the location filter.
        // Otherwise, trap the search within a ~100km local radius (approx 100/6378.1 radians).
        if (!isGlobal) {
            const defaultRadiusRadians = DISCOVERY_CONSTANTS.LOCAL_SEARCH_RADIUS_KM / DISCOVERY_CONSTANTS.EARTH_RADIUS_KM;
            filter['location.coordinates'] = {
                $geoWithin: {
                    $centerSphere: [userContext.location.coordinates, defaultRadiusRadians]
                }
            };
        }

        // 3. Optional: Map other hard preferences here (Age, Gender, Outness) based on userContext.preference

        // 4. Atlas Vector Search Pipeline
        // Note: Target index 'personality_vector_index' with 1536 dims & cosine similarity as configured
        const pipeline = [
            {
                $vectorSearch: {
                    index: 'personality_vector_index',
                    path: 'personalityVector',
                    queryVector: userContext.personalityVector,
                    numCandidates: Math.max(limit * 10, 100), // Oversample for accurate recall
                    limit: limit + skip,
                    filter: filter
                }
            },
            { $skip: skip },
            { $limit: limit },
            {
                $project: {
                    matchScore: { $meta: 'vectorSearchScore' },
                    profile: 1,
                    preference: 1,
                    kycVerification: 1,
                    photos: 1,
                    location: 1,
                }
            }
        ];

        const cursor = collection.aggregate(pipeline);
        const results = await cursor.toArray();

        return results as DiscoveryCandidateRaw[];
    }
}