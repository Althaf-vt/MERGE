import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '../../domain/entities/user.entity';
import { AdoptionPreference, AuthProvider, DietType, DisabilityOption, DocumentType, DrinkingHabit, ImmigrationReadiness, IntersexOption, MaritalStatus, RelationshipGoal, RelationshipStatus, ReviewDecision, SelfieVerificationStatus, SmokingHabit, UserStatus, VerificationDevice, VerificationStatus } from '../../domain/enums/user.enums';
// Defines the MongoDB/Mongoose schema for storing User data in the DB.

// Mongoose document type combining the User schema with a MongoDb document.
export type UserDocument = User & Document;

// Sub-schema for user profile data
@Schema({_id: false})
export class UserProfileSchema{
    @Prop()
    displayName?: string;

    @Prop()
    customLabel?: string;

    @Prop()
    bio?: string;

    @Prop()
    phoneNumber?: string;

    @Prop()
    pronouns?: string;

    @Prop()
    genderIdentity?: string;

    @Prop()
    sexualOrientation?: string;

    @Prop({ type: String, enum: IntersexOption })
    intersex?: IntersexOption;

    @Prop()
    outnessLevel?: number;

    @Prop()
    city?: string;

    @Prop()
    state?: string;

    @Prop()
    country?: string;

    @Prop()
    heightCm?: number;

    @Prop({ type: [String], default: [] })
    languages: string[];

    @Prop({ type: [String], default: [] })
    selectedTraits: string[];

    @Prop({ type: [String], default: [] })
    interests: string[];

    @Prop({ type: [String], default: [] })
    education: string[];

    @Prop()
    occupation?: string;

    @Prop({ type: [String], default: [] })
    incomeRange: string[];

    @Prop()
    religion?: string;

    @Prop({ type: String, enum: DisabilityOption })
    disability?: DisabilityOption;

    @Prop({ type: String, enum: DietType })
    diet?: DietType;

    @Prop({ type: String, enum: SmokingHabit })
    smokingHabit?: SmokingHabit;

    @Prop({ type: String, enum: DrinkingHabit })
    drinkingHabit?: DrinkingHabit;

    @Prop({ type: String, enum: RelationshipGoal })
    relationshipGoal?: RelationshipGoal;

    @Prop({ type: String, enum: RelationshipStatus })
    relationshipStatus?: RelationshipStatus;

    @Prop({ type: String, enum: MaritalStatus })
    maritalStatus?: MaritalStatus;

    @Prop({ type: String, enum: ImmigrationReadiness })
    immigrationReady?: ImmigrationReadiness;

    @Prop({ type: String, enum: AdoptionPreference })
    openToAdoption?: AdoptionPreference;

    @Prop({ default: 0 })
    profileCompletion: number;

    @Prop({ default: true })
    isProfileVisible: boolean;
}

// Defining a sub-schema for the KYC data
@Schema({_id: false}) // _id is false coz it belongs to the parent User document
class KycVerificationSchema{
    @Prop({type: String, enum: VerificationStatus, default: VerificationStatus.NOT_STARTED})
    verificationStatus: VerificationStatus;

    @Prop({ type: String, enum: ReviewDecision })
    reviewDecision?: ReviewDecision;

    @Prop({ default: 0 })
    verificationAttempt?: number;

    @Prop({type: String, enum: DocumentType})
    documentType?: DocumentType;
    
    @Prop()
    issuingCountry: string;

    @Prop({ type: String, enum: VerificationDevice, default: VerificationDevice.CURRENT_DEVICE })
    verificationDevice?: VerificationDevice;

    @Prop()
    qrSessionId?: string;

    @Prop()
    documentFrontS3?: string;

    @Prop()
    documentBackS3?: string;

    @Prop()
    legalName?: string;

    @Prop()
    verifiedDOB?: Date;

    // This is the critical field we query against for duplicated
    @Prop({index: true})
    hashedDocumentNumber?: string;

    @Prop()
    ocrConfidence?: number;

    // --- Phase 8A: Identity Baseline ---

    @Prop()
    liveSelfieS3?: string;

    @Prop({ type: [Number], default: [] })
    selfieFaceEmbedding?: number[];

    @Prop()
    selfieConfidence?: number;

    @Prop({ type: String, enum: SelfieVerificationStatus, default: SelfieVerificationStatus.NOT_STARTED })
    selfieVerificationStatus?: SelfieVerificationStatus;

    // --- Phase 8B: Active Liveness Challenge ---
    @Prop({ type: [{ prompt: String, score: Number, status: String, videoS3: String }], default: [] })
    livenessResults?: any[];

    @Prop({ default: false })
    verificationSubmitted?: boolean;

    @Prop({ default: false })
    manualReviewRequired?: boolean;

    @Prop()
    adminReviewedBy?: string;

    @Prop()
    rejectionReason?: string;

    @Prop()
    submittedAt?: Date;

    @Prop()
    approvedAt?: Date;

    @Prop()
    rejectedAt?: Date;
}

// export type UserDocument = User & Document;

// Defines the User collection and enables automatic createdAt and updatedAt timestamps.
@Schema({timestamps: true, collection: 'users'})
export class User{
    @Prop({required: true, unique: true, lowercase: true, trim: true})
    email: string;

    @Prop({
        type: String,
        default: null,
        validate: {
            validator: function(this: any, val: string | null) {
                // If authProvider is EMAIL, passwordHash must be a valid non-empty string
                if (this.authProvider === AuthProvider.EMAIL) {
                    return typeof val === 'string' && val.trim().length > 0;
                }
                // For OAuth (Google, etc.), null or undefined is completely valid
                return true;
            },
            message: 'Path `passwordHash` is required for email registration.'
        }
    })
    passwordHash?: string | null;

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

    @Prop({type: UserProfileSchema, default: null})
    profile: UserProfileSchema;

    createdAt: Date;
    updatedAt: Date;
}

// Create the Mongoose schema from the User class definition.
export const UserSchema = SchemaFactory.createForClass(User);