import { Injectable } from "@nestjs/common";
import { BlockedUserReadModel, BlockedUsersQueryOptions, IBlockedRelationshipRepository } from "../../domain/interfaces/blocked-relationship-repository.interface";
import { InjectModel } from "@nestjs/mongoose";
import { BlockedRelationshipDocument, BlockedRelationshipSchemaClass } from "./blocked-relationship.schema";
import { Model, PipelineStage, Types } from "mongoose";
import { BlockedRelationship } from "../../domain/entities/blocked-relationship.entity";
import { BlockedRelationshipPersistenceMapper } from "./mappers/blocked-relationship-persistence.mapper";
import { SortOrder } from "../../domain/enums/user.enums";
import { PhotoVerificationStatus } from "../../domain/enums/profile.enums";

@Injectable()
export class MongoBlockedRelationshipRepository implements IBlockedRelationshipRepository {
    constructor(
        @InjectModel(BlockedRelationshipSchemaClass.name)
        private readonly _model: Model<BlockedRelationshipDocument>
    ) { }

    async create(relationship: BlockedRelationship): Promise<BlockedRelationship> {
        const data = BlockedRelationshipPersistenceMapper.toPersistence(relationship);
        const created = new this._model(data);
        const saved = await created.save();
        return BlockedRelationshipPersistenceMapper.toDomain(saved);
    }

    async findByPair(blockerId: string, blockedId: string): Promise<BlockedRelationship | null> {
        const doc = await this._model.findOne({
            blockerId: new Types.ObjectId(blockerId),
            blockedId: new Types.ObjectId(blockedId),
        }).exec();

        if (!doc) return null;
        return BlockedRelationshipPersistenceMapper.toDomain(doc);
    }

    async findByBlockerId(blockerId: string, options?: BlockedUsersQueryOptions): Promise<BlockedRelationship[]> {
        const query: any = { blockerId: new Types.ObjectId(blockerId) };
        const sortDirection = options?.sortBy === SortOrder.OLDEST ? 1 : -1;

        const docs = await this._model.find(query)
            .sort({ createdAt: sortDirection })
            .exec();

        return docs.map(doc => BlockedRelationshipPersistenceMapper.toDomain(doc));
    }

    async delete(blockerId: string, blockedId: string): Promise<void> {
        await this._model.deleteOne({
            blockerId: new Types.ObjectId(blockerId),
            blockedId: new Types.ObjectId(blockedId),
        }).exec();
    }

    async countByBlockerId(blockerId: string): Promise<number> {
        return await this._model.countDocuments({ blockerId: new Types.ObjectId(blockerId) }).exec();
    }

    async getHydratedBlockedUsers(blockerId: string, options?: BlockedUsersQueryOptions): Promise<BlockedUserReadModel[]> {
        const pipeline: PipelineStage[] = [
            // 1. Isolate the user's blocks
            { $match: { blockerId: new Types.ObjectId(blockerId) } },
            
            // 2. Lookup target user document
            {
                $lookup: {
                    from: 'users',
                    localField: 'blockedId',
                    foreignField: '_id',
                    as: 'targetUser'
                }
            },
            
            // 3. Unwind but preserve records if the target account was deleted
            { 
                $unwind: { 
                    path: '$targetUser', 
                    preserveNullAndEmptyArrays: true 
                } 
            }
        ];

        // 4. DB-Level Search Filtering (Regex applied pre-projection)
        if (options?.search) {
            pipeline.push({
                $match: {
                    $or: [
                        { 'targetUser.profile.displayName': { $regex: options.search, $options: 'i' } },
                        { 'targetUser.profile.customLabel': { $regex: options.search, $options: 'i' } }
                    ]
                }
            });
        }

        // 5. Sort via domain rules
        const sortDirection = options?.sortBy === SortOrder.OLDEST ? 1 : -1;
        pipeline.push({ $sort: { createdAt: sortDirection } });

        // 6. Project only the required Read Model fields (Memory Optimization)
        pipeline.push({
            $project: {
                _id: 0,
                blockedId: { $toString: '$blockedId' },
                reason: 1,
                blockedAt: '$createdAt',
                isDeleted: { $eq: [{ $type: '$targetUser._id' }, 'missing'] },
                displayName: { $ifNull: ['$targetUser.profile.displayName', null] },
                genderIdentity: { $ifNull: ['$targetUser.profile.genderIdentity', null] },
                customLabel: { $ifNull: ['$targetUser.profile.customLabel', null] },
                city: { $ifNull: ['$targetUser.profile.city', null] },
                state: { $ifNull: ['$targetUser.profile.state', null] },
                
                // Extract ONLY the URL of the primary, approved photo using native array filtering
                avatarUrl: {
                    $let: {
                        vars: {
                            primaryPhoto: {
                                $arrayElemAt: [
                                    {
                                        $filter: {
                                            input: { $ifNull: ['$targetUser.photos', []] },
                                            as: 'photo',
                                            cond: {
                                                $and: [
                                                    { $eq: ['$$photo.isPrimary', true] },
                                                    { $eq: ['$$photo.status', PhotoVerificationStatus.APPROVED] }
                                                ]
                                            }
                                        }
                                    }, 
                                    0
                                ]
                            }
                        },
                        in: '$$primaryPhoto.url'
                    }
                }
            }
        });

        return await this._model.aggregate<BlockedUserReadModel>(pipeline).exec();
    }
}