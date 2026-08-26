import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole, KycStatus } from '../../domain/entities/user.entity';
import { AuthProvider, UserStatus } from '../../domain/enums/user.enums';
// Defines the MongoDB/Mongoose schema for storing User data in the DB.

// Mongoose document type combining the User schema with a MongoDb document.
export type UserDocument = User & Document;

// Defines the User collection and enables automatic createdAt and updatedAt timestamps.
@Schema({timestamps: true, collection: 'users'})
export class User{
    @Prop({required: true, unique: true, lowercase: true, trim: true})
    email: string;

    @Prop({required: true})
    passwordHash: string;

    @Prop({type: String, enum: AuthProvider, default: AuthProvider.EMAIL})
    authProvider: string;

    @Prop({default: false})
    isEmailVerified: boolean;

    @Prop({default: false})
    kycCompleted: boolean;

    @Prop({type: String, enum: UserStatus, default: UserStatus.ACTIVE})
    accountStatus: string;

    @Prop({default: 1})
    onboardingStep: number;

    @Prop({default: false})
    onboardingCompleted: boolean;

    @Prop({default: false})
    profileCompleted: boolean;

    @Prop({default: false})
    castingDirectorCompleted: boolean;

    @Prop({default: true})
    lumenEnabled: boolean;

    @Prop({type: [Number], default: []})
    dailyMatchHours: number[];

    @Prop({default: 0})
    lumenRecommendationGeneratedToday: number;

    @Prop({default: Date.now})
    lastLumenReset: Date;

    @Prop({default: null})
    lastLogin: Date;

    createdAt: Date;
    updatedAt: Date;
}

// Create the Mongoose schema from the User class definition.
export const UserSchema = SchemaFactory.createForClass(User);