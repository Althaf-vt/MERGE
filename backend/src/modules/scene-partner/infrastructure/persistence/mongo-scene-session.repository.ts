import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { isValidObjectId, Model } from "mongoose";
import { BaseRepository } from "../../../../shared/infrastructure/persistence/base-mongo.repository";
import { SceneSession } from "../../domain/entities/scene-session.entity";
import { ScenarioCategory, SceneSessionStatus, SimulationType } from "../../../../shared/domain/enums/scene-partner.enums";
import { AdminSessionsFilter, ISceneSessionRepository, PaginatedSceneSessionsResult, ScenarioDailyTrendRawData, ScenarioMetricsRawData, ScenarioSummaryStatsRawData, ScenePartnerAnalyticsRawData } from "../../domain/interfaces/scene-session-repository.interface";
import { SceneSessionDocument, SceneSessionSchemaClass } from "./scene-session.schema";
import { SceneSessionPersistenceMapper } from "./mappers/scene-session-persistence.mapper";

@Injectable()
export class SceneSessionRepository extends BaseRepository<SceneSession, SceneSessionDocument> implements ISceneSessionRepository {
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
                isPreview: { $ne: true },
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
        const query = { userId, isPreview: { $ne: true } };

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

    async findAdminSessions(filter: AdminSessionsFilter): Promise<PaginatedSceneSessionsResult> {
        const query: Record<string, unknown> = {
            isPreview: { $ne: true },
        };

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
                $match: {
                    isPreview: { $ne: true },
                },
            },
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

    async getScenarioMetricsMap(): Promise<Record<string, ScenarioMetricsRawData>> {
        const results = await this._model.aggregate([
            {
                $match: {
                    isPreview: { $ne: true },
                },
            },
            {
                $group: {
                    _id: "$scenarioId",
                    totalSessions: { $sum: 1 },
                    completedSessions: {
                        $sum: {
                            $cond: [{ $eq: ["$status", SceneSessionStatus.COMPLETED] }, 1, 0],
                        },
                    },
                },
            },
        ]).exec();

        const metricsMap: Record<string, ScenarioMetricsRawData> = {};
        for (const item of results) {
            if (item._id) {
                metricsMap[item._id.toString()] = {
                    totalSessions: item.totalSessions ?? 0,
                    completedSessions: item.completedSessions ?? 0,
                };
            }
        }
        return metricsMap;
    }

    async getScenarioSummaryStats(scenarioId: string): Promise<ScenarioSummaryStatsRawData | null> {
        const [result] = await this._model.aggregate([
            {
                $match: {
                    scenarioId,
                    isPreview: { $ne: true },
                },
            },
            {
                $group: {
                    _id: null,
                    totalSessions: { $sum: 1 },
                    completedSessions: {
                        $sum: { $cond: [{ $eq: ["$status", SceneSessionStatus.COMPLETED] }, 1, 0] },
                    },
                    coachingEnabledCount: {
                        $sum: { $cond: [{ $eq: ["$isCoachingEnabled", true] }, 1, 0] },
                    },
                    averageTurnCount: { $avg: "$turnCount" },
                    averageDurationMinutes: {
                        $avg: {
                            $cond: [
                                { $ne: ["$completedAt", null] },
                                {
                                    $max: [
                                        0,
                                        {
                                            $divide: [
                                                {
                                                    $subtract: [
                                                        { $subtract: ["$completedAt", "$createdAt"] },
                                                        { $ifNull: ["$totalPausedMs", 0] },
                                                    ],
                                                },
                                                60000,
                                            ],
                                        },
                                    ],
                                },
                                null,
                            ],
                        },
                    },
                },
            },
        ]).exec();

        if (!result) {
            return {
                totalSessions: 0,
                completedSessions: 0,
                completionRate: 0,
                averageDurationMinutes: 0,
                averageTurnCount: 0,
                coachingAdoptionRate: 0,
            };
        }

        const totalSessions = result.totalSessions ?? 0;
        const completedSessions = result.completedSessions ?? 0;
        const coachingEnabledCount = result.coachingEnabledCount ?? 0;
        const completionRate = totalSessions > 0
            ? Math.round((completedSessions / totalSessions) * 1000) / 10
            : 0;
        const coachingAdoptionRate = totalSessions > 0
            ? Math.round((coachingEnabledCount / totalSessions) * 1000) / 10
            : 0;
        const averageTurnCount = result.averageTurnCount !== undefined && result.averageTurnCount !== null
            ? Math.round(result.averageTurnCount * 10) / 10
            : 0;
        const averageDurationMinutes = result.averageDurationMinutes !== undefined && result.averageDurationMinutes !== null
            ? Math.round(result.averageDurationMinutes * 10) / 10
            : 0;

        return {
            totalSessions,
            completedSessions,
            completionRate,
            averageDurationMinutes,
            averageTurnCount,
            coachingAdoptionRate,
        };
    }

    async getScenarioDailyTrends(scenarioId: string, days: number): Promise<ScenarioDailyTrendRawData[]> {
        const safeDays = Math.max(1, days);
        const startDate = new Date();
        startDate.setUTCDate(startDate.getUTCDate() - (safeDays - 1));
        startDate.setUTCHours(0, 0, 0, 0);

        const results = await this._model.aggregate([
            {
                $match: {
                    scenarioId,
                    isPreview: { $ne: true },
                    createdAt: { $gte: startDate },
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                    },
                    totalSessions: { $sum: 1 },
                    completedSessions: {
                        $sum: { $cond: [{ $eq: ["$status", SceneSessionStatus.COMPLETED] }, 1, 0] },
                    },
                },
            },
            {
                $sort: { _id: 1 },
            },
        ]).exec();

        const resultMap = new Map<string, { totalSessions: number; completedSessions: number }>();
        for (const item of results) {
            if (item._id) {
                resultMap.set(item._id, {
                    totalSessions: item.totalSessions || 0,
                    completedSessions: item.completedSessions || 0,
                });
            }
        }

        const dailyTrends: ScenarioDailyTrendRawData[] = [];
        const currentDate = new Date(startDate);
        const now = new Date();

        while (currentDate <= now) {
            const dateStr = currentDate.toISOString().split("T")[0];
            const metrics = resultMap.get(dateStr) ?? { totalSessions: 0, completedSessions: 0 };
            const completionRate = metrics.totalSessions > 0
                ? Math.round((metrics.completedSessions / metrics.totalSessions) * 1000) / 10
                : 0;

            dailyTrends.push({
                date: dateStr,
                totalSessions: metrics.totalSessions,
                completedSessions: metrics.completedSessions,
                completionRate,
            });

            currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        }

        return dailyTrends;
    }

    async findRecentByScenarioId(scenarioId: string, limit: number = 5): Promise<SceneSession[]> {
        const safeLimit = Math.max(1, limit);
        const documents = await this._model
            .find({
                scenarioId,
                isPreview: { $ne: true },
            })
            .sort({ createdAt: -1 })
            .limit(safeLimit)
            .exec();

        return documents.map((doc) => this.toDomain(doc as SceneSessionDocument));
    }

    async deleteById(id: string, userId: string): Promise<boolean> {
        if (!isValidObjectId(id)) {
            return false;
        }

        const result = await this._model.deleteOne({ _id: id, userId }).exec();
        return (result.deletedCount ?? 0) > 0;
    }
}
