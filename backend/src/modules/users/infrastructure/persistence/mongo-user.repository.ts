import { Injectable } from "@nestjs/common";
import { IUserRepository, PaginatedResult, UserFilters } from "../../domain/interfaces/user-repository.interface";
import { InjectModel } from "@nestjs/mongoose";
import { UserAggregate } from "../../domain/entities/user.entity";
import { UserPersistenceMapper } from "./mappers/user-persistence.mapper";
import { User, UserDocument } from "./user.schema";
import { Model } from "mongoose";
import { LivenessEvaluationRecord, UserKyc } from "../../domain/entities/kyc-verification.entity";
import { BaseMongoRepository } from "../../../../shared/infrastructure/persistence/base-mongo.repository";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class MongoUserRepository extends BaseMongoRepository<UserAggregate, UserDocument> implements IUserRepository{

    constructor(
        @InjectModel(User.name) model: Model<UserDocument>,
        eventEmitter: EventEmitter2
    ){
        super(model, eventEmitter);
    }

    protected toDomain(document: UserDocument): UserAggregate {
        return UserPersistenceMapper.toDomain(document);
    }

    protected toPersistence(entity: UserAggregate): Record<string, unknown> {
        return UserPersistenceMapper.toPersistence(entity);
    }

    async findByEmail(email: string): Promise<UserAggregate | null> {
        const document = await this._model.findOne({email}).exec();
        if(!document) return null;
        return UserPersistenceMapper.toDomain(document);
    }

    async findByDocumentHash(documentHash: string): Promise<UserKyc | null> {
        const document = await this._model.findOne({
            'kycVerification.hashedDocumentNumber': documentHash
        }).exec();
        if(!document) return null;
        
        const userAggregate = UserPersistenceMapper.toDomain(document);
        return userAggregate.kycVerification || null;
    }

    async addLivenessResult(userId: string, record: LivenessEvaluationRecord): Promise<void> {
        await this._model.updateOne(
            {_id: userId},
            {
                $push:{
                    'kycVerification.livenessResults': record
                }
            }
        ).exec();
    }

    async saveLivenessUpdate(user: UserAggregate, record: LivenessEvaluationRecord): Promise<void> {
        if (!user.id) return;
        
        await this._model.updateOne(
            { _id: user.id },
            {
                $push: {
                    'kycVerification.livenessResults': record
                }
            }
        ).exec();

        // Preserves aggregate cohesiveness by dispatching any domain events generated during the check
        await this.dispatchEvents(user);
    }

    async findAllPaginated(filters: UserFilters): Promise<PaginatedResult<UserAggregate>> {
        const query: Record<string, unknown> = {};

        if(filters.search){
            query['email'] = {$regex: filters.search, $options: 'i'};
        }
        if(filters.status){
            query['accountStatus'] = filters.status;
        }

        const skip = (filters.page - 1) * filters.limit;
        const [documents, total] = await Promise.all([
            this._model.find(query).skip(skip).limit(filters.limit).exec(),
            this._model.countDocuments(query).exec()
        ]);

        return {
            data: documents.map(doc => this.toDomain(doc as unknown as UserDocument)),
            total,
            page: filters.page,
            limit: filters.limit
        };
    }
}