import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole, KycStatus } from '../../domain/entities/user.entity';
import { AuthProvider, DocumentType, UserStatus, VerificationStatus } from '../../domain/enums/user.enums';
// Defines the MongoDB/Mongoose schema for storing User data in the DB.

// Mongoose document type combining the User schema with a MongoDb document.
export type UserDocument = User & Document;

// Defining a sub-schema for the KYC data

@Schema({_id: false}) // _id is false coz it belongs to the parent User document
class KycVerificationSchema{
    @Prop({type: String, enum: VerificationStatus, default: VerificationStatus.NOT_STARTED})
    verificationStatus: VerificationStatus;

    @Prop({type: String, enum: DocumentType})
    documentType: DocumentType;

    @Prop()
    issuingCountry: string;

    @Prop()
    documentFrontS3: string;

    @Prop()
    documentBackS3: string;

    @Prop()
    legalName: string;

    @Prop()
    verifiedDOB: Date;

    // This is the critical field we query against for duplicated
    @Prop({index: true})
    hashedDocumentNumber: string;

    @Prop()
    ocrConfidence: number;
}

// export type UserDocument = User & Document;

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

    // Embed the KYC schema
    @Prop({type: KycVerificationSchema, default: null})
    kycVerification: KycVerificationSchema;

    createdAt: Date;
    updatedAt: Date;
}

// Create the Mongoose schema from the User class definition.
export const UserSchema = SchemaFactory.createForClass(User);