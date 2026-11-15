import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { isValidObjectId, Model } from "mongoose";
import { BaseRepository } from "../../../../shared/infrastructure/persistence/base-mongo.repository";
import { SceneSession } from "../../domain/entities/scene-session.entity";
import { ScenarioCategory, SceneSessionStatus, SimulationType } from "../../../../shared/domain/enums/scene-partner.enums";
import { AdminSessionsFilter, ISceneSessionRepository, PaginatedSceneSessionsResult, ScenePartnerAnalyticsRawData } from "../../domain/interfaces/scene-session-repository.interface";
import { SceneSessionDocument, SceneSessionSchemaClass } from "./scene-session.schema";
import { SceneSessionPersistenceMapper } from "./mappers/scene-session-persistence.mapper";

@Injectable()
export class MongoSceneSessionRepository extends BaseRepository<SceneSession, SceneSessionDocument> implements ISceneSessionRepository {
    constructor(
        @InjectModel(SceneSessionSchemaClass.name) model: Model<SceneSessionDocument>,
        eventEmitter: EventEmitter2,
    ) {
        super(model, eventEmitter);
    }

    protected toDomain(document: SceneSessionDocument): SceneSession {
        return SceneSessionPersistenceMapper.toDomain(document);
    }

    protected toPersistence(entity: SceneSession): Record<string, unknown> {
        return SceneSessionPersistenceMapper.toPersistence(entity);
    }

    async findActiveByUserId(userId: string): Promise<SceneSession | null> {
        const document = await this._model
            .findOne({
                userId,
                status: {
                    $in: [
                        SceneSessionStatus.INITIALIZING,
                        SceneSessionStatus.IN_PROGRESS,
                        SceneSessionStatus.PAUSED,
                    ],
                },
            })
            .exec();

        if (!document) return null;
        return this.toDomain(document as SceneSessionDocument);
    }

    async findAllByUserId(userId: string, limit: number = 20, skip: number = 0): Promise<PaginatedSceneSessionsResult> {
        const safeLimit = Math.max(1, limit);
        const safeSkip = Math.max(0, skip);

        const [documents, total] = await Promise.all([
            this._model
                .find({ userId })
                .sort({ createdAt: -1 })
                .skip(safeSkip)
                .limit(safeLimit)
                .exec(),
            this._model.countDocuments({ userId }).exec(),
        ]);

        return {
            data: documents.map((doc) => this.toDomain(doc as SceneSessionDocument)),
            total,
        };
    }

    async findAdminSessions(filter: AdminSessionsFilter): Promise<PaginatedSceneSessionsResult> {
        const query: Record<string, unknown> = {};

        if (filter.userId && filter.userId.trim().length > 0) {
            query.userId = filter.userId.trim();
        }

        if (filter.scenarioId && filter.scenarioId.trim().length > 0) {
            query.scenarioId = filter.scenarioId.trim();
        }

        if (filter.simulationType) {
            query.simulationType = filter.simulationType;
        }

        if (filter.status) {
            query.status = filter.status;
        }

        if (filter.startDate || filter.endDate) {
            const dateQuery: Record<string, Date> = {};
            if (filter.startDate) {
                dateQuery.$gte = filter.startDate;
            }
            if (filter.endDate) {
                dateQuery.$lte = filter.endDate;
            }
            query.createdAt = dateQuery;
        }

        const safeLimit = Math.max(1, filter.limit ?? 20);
        const safeSkip = Math.max(0, filter.skip ?? 0);

        const [documents, total] = await Promise.all([
            this._model
                .find(query)
                .sort({ createdAt: -1 })
                .skip(safeSkip)
                .limit(safeLimit)
                .exec(),
            this._model.countDocuments(query).exec(),
        ]);

        return {
            data: documents.map((doc) => this.toDomain(doc as SceneSessionDocument)),
            total,
        };
    }

    async getAnalytics(): Promise<ScenePartnerAnalyticsRawData> {
        const [facetResult] = await this._model.aggregate([
            {
                $facet: {
                    overview: [
                        {
                            $group: {
                                _id: null,
                                totalSessions: { $sum: 1 },
                                completedSessions: {
                                    $sum: { $cond: [{ $eq: ["$status", SceneSessionStatus.COMPLETED] }, 1, 0] },
                                },
                                inProgressSessions: {
                                    $sum: { $cond: [{ $eq: ["$status", SceneSessionStatus.IN_PROGRESS] }, 1, 0] },
                                },
                                pausedSessions: {
                                    $sum: { $cond: [{ $eq: ["$status", SceneSessionStatus.PAUSED] }, 1, 0] },
                                },
                                coachingEnabledCount: {
                                    $sum: { $cond: [{ $eq: ["$isCoachingEnabled", true] }, 1, 0] },
                                },
                                coachingDisabledCount: {
                                    $sum: { $cond: [{ $eq: ["$isCoachingEnabled", false] }, 1, 0] },
                                },
                                genericCount: {
                                    $sum: { $cond: [{ $eq: ["$simulationType", SimulationType.GENERIC] }, 1, 0] },
                                },
                                matchBasedCount: {
                                    $sum: { $cond: [{ $eq: ["$simulationType", SimulationType.MATCH_BASED] }, 1, 0] },
                                },
                                averageScore: { $avg: "$summary.communicationScore" },
                                averageTurnCount: { $avg: "$turnCount" },
                            },
                        },
                    ],
                    topScenarios: [
                        {
                            $group: {
                                _id: {
                                    scenarioId: "$scenarioId",
                                    scenarioTitle: "$scenarioTitle",
                                    category: "$scenarioCategory",
                                },
                                count: { $sum: 1 },
                            },
                        },
                        { $sort: { count: -1 } },
                        { $limit: 10 },
                        {
                            $project: {
                                _id: 0,
                                scenarioId: "$_id.scenarioId",
                                scenarioTitle: "$_id.scenarioTitle",
                                category: "$_id.category",
                                count: 1,
                            },
                        },
                    ],
                    categoryDistribution: [
                        {
                            $group: {
                                _id: "$scenarioCategory",
                                count: { $sum: 1 },
                            },
                        },
                        { $sort: { count: -1 } },
                        {
                            $project: {
                                _id: 0,
                                category: "$_id",
                                count: 1,
                            },
                        },
                    ],
                },
            },
        ]).exec();

        const overview = facetResult?.overview?.[0] ?? {};

        return {
            totalSessions: overview.totalSessions ?? 0,
            completedSessions: overview.completedSessions ?? 0,
            inProgressSessions: overview.inProgressSessions ?? 0,
            pausedSessions: overview.pausedSessions ?? 0,
            coachingEnabledCount: overview.coachingEnabledCount ?? 0,
            coachingDisabledCount: overview.coachingDisabledCount ?? 0,
            genericCount: overview.genericCount ?? 0,
            matchBasedCount: overview.matchBasedCount ?? 0,
            averageScore: overview.averageScore !== undefined && overview.averageScore !== null
                ? Math.round(overview.averageScore * 10) / 10
                : null,
            averageTurnCount: overview.averageTurnCount !== undefined && overview.averageTurnCount !== null
                ? Math.round(overview.averageTurnCount * 10) / 10
                : 0,
            topScenarios: (facetResult?.topScenarios ?? []).map((item: { scenarioId: string; scenarioTitle: string; category: ScenarioCategory; count: number }) => ({
                scenarioId: item.scenarioId,
                scenarioTitle: item.scenarioTitle,
                category: item.category as ScenarioCategory,
                count: item.count,
            })),
            categoryDistribution: (facetResult?.categoryDistribution ?? []).map((item: { category: ScenarioCategory; count: number }) => ({
                category: item.category as ScenarioCategory,
                count: item.count,
            })),
        };
    }

    async deleteById(id: string, userId: string): Promise<boolean> {
        if (!isValidObjectId(id)) {
            return false;
        }

        const result = await this._model.deleteOne({ _id: id, userId }).exec();
        return (result.deletedCount ?? 0) > 0;
    }
}
