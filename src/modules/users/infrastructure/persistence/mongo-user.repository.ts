import { Injectable } from "@nestjs/common";
import { IUserRepository } from "../../domain/interfaces/user-repository.interface";
import { InjectModel } from "@nestjs/mongoose";
import { UserAggregate } from "../../domain/entities/user.entity";
import { UserPersistenceMapper } from "./mappers/user-persistence.mapper";
import { User, UserDocument } from "./user.schema";
import { Model } from "mongoose";


// MongoDB implementation of the UserRepository.
// Handles User persistence and converts between domain entities and MongoDB documents.
@Injectable()
export class MongoUserRepository implements IUserRepository{

    // Injects the Mongoose User model used to perform database operations.
    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>
    ){}

    // Finds a user by email and converts the document into a domain entity.
    async findByEmail(email: string): Promise<UserAggregate | null> {
        const document = await this.userModel.findOne({email}).exec();
        if(!document) return null;
        return UserPersistenceMapper.toDomain(document);
    }

    // Finds a user by ID and converts the database document into a domain entity.
    async findById(id: string): Promise<UserAggregate | null> {
        const document = await this.userModel.findById(id).exec();
        if(!document) return null;
        return UserPersistenceMapper.toDomain(document);
    }

    // Converts the domain entity into persistence data and creates a new MongoDB document.
    async create(user: UserAggregate): Promise<UserAggregate> {
        const persistenceData = UserPersistenceMapper.toPersistence(user);
        const created = new this.userModel(persistenceData);
        const document = await created.save();
        return UserPersistenceMapper.toDomain(document);
    }

    // Updates the existing MongoDB document and returns the updated domain entity.
    async update(user: UserAggregate): Promise<UserAggregate> {
        const persistenceData = UserPersistenceMapper.toPersistence(user);
        const document = await this.userModel
            .findByIdAndUpdate(user.id, persistenceData, {new: true})
            .exec();

        if(!document) throw new Error("User not found");
        return UserPersistenceMapper.toDomain(document);
    }
}