import { Injectable } from "@nestjs/common";
import { IUserRepository } from "../../domain/interfaces/user-repository.interface";
import { InjectModel } from "@nestjs/mongoose";
import { UserAggregate } from "../../domain/entities/user.entity";
import { UserPersistenceMapper } from "./mappers/user-persistence.mapper";
import { User, UserDocument } from "./user.schema";
import { Model } from "mongoose";
import { LivenessEvaluationRecord, UserKyc } from "../../domain/entities/kyc-verification.entity";
import { BaseMongoRepository } from "../../../../shared/infrastructure/persistence/base-mongo.repository";

// MongoDB implementation of the UserRepository.
// Handles User persistence and converts between domain entities and MongoDB documents.
@Injectable()
export class MongoUserRepository extends BaseMongoRepository<UserAggregate, UserDocument> implements IUserRepository{

    // Injects the Mongoose User model used to perform database operations.
    constructor(
        @InjectModel(User.name)
        model: Model<UserDocument>
    ){
        super(model); // Passes the model to the BaseMongoRepository
    }

    // Fulfill the abstract mapping requirements from the Base Class
    protected toDomain(document: UserDocument): UserAggregate {
        return UserPersistenceMapper.toDomain(document);
    }

    protected toPersistence(entity: UserAggregate): any {
        return UserPersistenceMapper.toPersistence(entity);
    }

    // Finds a user by email and converts the document into a domain entity.
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
        
        //  Convert the raw document to our Domain Aggregate
        const userAggregate = UserPersistenceMapper.toDomain(document);

        // Extract and return just the KYC portion
        return userAggregate.kycVerification || null;
    }

    // Atomic operation: Appends result directly without serializing/overwriting the entire aggregate
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
}