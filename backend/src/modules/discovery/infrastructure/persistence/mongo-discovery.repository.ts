import { Injectable } from "@nestjs/common";
import { IDiscoveryRepository } from "../../domain/interfaces/discovery-repository.interface";
import { DiscoveryCandidate, DiscoveryUserSearchContext, VectorSearchParams } from "../../domain/interfaces/discovery.types";
import { DiscoveryPass } from "../../domain/entities/discovery-pass.entity";
import { DiscoveryPersistenceMapper } from "./mappers/discovery-persistence.mapper";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection, PipelineStage, Types } from "mongoose";
import { DISCOVERY_CONSTANTS } from "../../domain/constants/discovery.constants";
import { EnvConfig } from "../../../../shared/infrastructure/config/env.config";
import { DISCOVERY_PERSISTENCE_COLLECTIONS } from "../constants/discovery-persistence.constants";

@Injectable()
export class DiscoveryRepository implements IDiscoveryRepository {
    constructor(@InjectConnection() private readonly _connection: Connection) { }

    async getUserSearchContext(userId: string): Promise<DiscoveryUserSearchContext | null> {
        const user = await this._connection.collection(DISCOVERY_PERSISTENCE_COLLECTIONS.USERS).findOne(
            { _id: new Types.ObjectId(userId) },
            { projection: { personalityVector: 1, location: 1, preference: 1 } }
        );
        if (!user) {
            return null;
        }
        return DiscoveryPersistenceMapper.toDomainUserSearchContext(user);
    }

    async findVectorMatches(params: VectorSearchParams): Promise<DiscoveryCandidate[]> {
        const { userContext, isGlobal, excludedIds, limit, skip } = params;
        const collection = this._connection.collection(DISCOVERY_PERSISTENCE_COLLECTIONS.USERS);

        // Convert string IDs to ObjectIds within the persistence layer
        const objectIdExcludedIds = (excludedIds || []).map(id => new Types.ObjectId(id));

        // 1. Construct strict base business rules (scalar filter fields only for Atlas)
        const filter: Record<string, unknown> = {
            accountStatus: 'ACTIVE',
            kycCompleted: true,
            _id: { $nin: objectIdExcludedIds },
        };

        // 2. Buffer candidate limit for vector stage if local geospatial filtering will post-filter candidates
        const vectorLimit = isGlobal ? (limit + skip) : Math.max((limit + skip) * 5, 50);

        // 3. Atlas Vector Search Pipeline
        // Note: Target index 'personality_vector_index' with 1536 dims & cosine similarity as configured
        const pipeline: PipelineStage[] = [
            {
                $vectorSearch: {
                    index: 'personality_vector_index',
                    path: 'personalityVector',
                    queryVector: userContext.personalityVector,
                    numCandidates: Math.max(limit * 10, 100), // Oversample for accurate recall
                    limit: vectorLimit,
                    filter: filter
                }
            }
        ];

        // 4. CONDITIONAL GEOSPATIAL BOUNDING
        // In Atlas Vector Search, geospatial queries ($geoWithin / $centerSphere) must be executed
        // in a post-vector $match stage because $vectorSearch.filter only supports scalar filter fields.
        if (!isGlobal && userContext.location?.coordinates) {
            const defaultRadiusRadians = DISCOVERY_CONSTANTS.LOCAL_SEARCH_RADIUS_KM / DISCOVERY_CONSTANTS.EARTH_RADIUS_KM;
            pipeline.push({
                $match: {
                    'location.coordinates': {
                        $geoWithin: {
                            $centerSphere: [userContext.location.coordinates, defaultRadiusRadians]
                        }
                    }
                }
            });
        }

        pipeline.push(
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
        );

        const cursor = collection.aggregate(pipeline);
        const results = await cursor.toArray();

        return DiscoveryPersistenceMapper.toDomainCandidateList(results);
    }

    async recordPass(pass: DiscoveryPass): Promise<void> {
        const data = DiscoveryPersistenceMapper.toPersistencePass(pass);
        await this._connection.collection(DISCOVERY_PERSISTENCE_COLLECTIONS.DISCOVERY_PASSES).updateOne(
            { userId: data.userId, targetUserId: data.targetUserId },
            { $set: data },
            { upsert: true }
        );
    }

    async getPassedUserIds(userId: string): Promise<string[]> {
        const cutoffDate = new Date(Date.now() - EnvConfig.discovery.passTtlSeconds * 1000);
        const docs = await this._connection.collection(DISCOVERY_PERSISTENCE_COLLECTIONS.DISCOVERY_PASSES).find(
            {
                userId,
                createdAt: { $gte: cutoffDate },
            },
            { projection: { targetUserId: 1 } }
        ).toArray();

        return docs.map(d => (d as { targetUserId?: string }).targetUserId).filter((id): id is string => Boolean(id));
    }
}