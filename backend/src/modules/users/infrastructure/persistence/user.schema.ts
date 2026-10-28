import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AdoptionPreference, AuthProvider, DietType, DisabilityOption, DocumentType, DrinkingHabit, HealthConditionPreference, ImmigrationReadiness, IntersexOption, MaritalStatus, RelationshipGoal, RelationshipStatus, ReviewDecision, SelfieVerificationStatus, SmokingHabit, UserStatus, VerificationDevice, VerificationStatus } from '../../domain/enums/user.enums';
import { InfectiousVisibility, PhotoVerificationStatus, ProfileVisibility } from '../../domain/enums/profile.enums';

export type UserDocument = User & Document;

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

@Schema({_id: false})
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

    @Prop({index: true})
    hashedDocumentNumber?: string;

    @Prop()
    ocrConfidence?: number;

    @Prop()
    liveSelfieS3?: string;

    @Prop({ type: [Number], default: [] })
    selfieFaceEmbedding?: number[];

    @Prop()
    selfieConfidence?: number;

    @Prop({ type: String, enum: SelfieVerificationStatus, default: SelfieVerificationStatus.NOT_STARTED })
    selfieVerificationStatus?: SelfieVerificationStatus;

    @Prop({ type: [{ prompt: String, score: Number, status: String, videoS3: String }], default: [] })
    livenessResults?: Array<{ prompt: string; score: number; status: string; videoS3?: string }>;

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

@Schema({_id: false})
export class UserPreferenceSchema {
    @Prop({ type: [String], default: [] })
    preferredGender?: string[];

    @Prop({ default: 18 })
    preferredAgeMin?: number;

    @Prop({ default: 45 })
    prefferedAgeMax?: number;

    @Prop({ type: String, enum: RelationshipGoal, default: RelationshipGoal.LONG_TERM_RELATIONSHIP })
    relationShipGoals?: RelationshipGoal;

    @Prop({ default: 1 })
    minimumOutnessLevel?: number;

    @Prop({ default: true })
    openToAdoption?: boolean;

    @Prop({ default: false })
    immigrationReady?: boolean;

    @Prop({ default: '' })
    partnerExpectations?: string;

    @Prop({ type: String, enum: Object.values(HealthConditionPreference), default: HealthConditionPreference.NO_PREFERENCE })
    diabeteBpPreference?: HealthConditionPreference;

    @Prop({ type: String, enum: Object.values(HealthConditionPreference), default: HealthConditionPreference.NO_PREFERENCE })
    fertilityPreference?: HealthConditionPreference;

    @Prop({ type: String, enum: Object.values(HealthConditionPreference), default: HealthConditionPreference.NO_PREFERENCE })
    geneticPreference?: HealthConditionPreference;

    @Prop({ type: String, enum: Object.values(HealthConditionPreference), default: HealthConditionPreference.NO_PREFERENCE })
    infectiousPreference?: HealthConditionPreference;

    @Prop({ type: String, enum: Object.values(HealthConditionPreference), default: HealthConditionPreference.NO_PREFERENCE })
    disablilityPreferece?: HealthConditionPreference;
}

@Schema({ _id: false })
export class UserMedicalSchema {
    @Prop({ default: null }) 
    diabetes?: string;

    @Prop({ default: null }) 
    bloodPressure?: string;
    
    @Prop({ type: Object, default: null }) 
    fertility?: { status: string; details?: string };
    
    @Prop({ type: Object, default: null }) 
    genetic?: { status: string; details?: string };
    
    @Prop({ type: Object, default: null }) 
    infectious?: { hiv: string; hepatitis: string };
    
    @Prop({ type: String, enum: Object.values(InfectiousVisibility), default: InfectiousVisibility.HIDDEN }) 
    infectiousVisibility: string;
    
    @Prop({ type: Object, default: null }) 
    disability?: { hasDisability: boolean; details?: string };

    @Prop({ type: Date, default: Date.now }) 
    updatedAt: Date;
}

@Schema({ _id: false })
export class UserPrivacySchema {
    @Prop({ default: true }) 
    showAge: boolean;

    @Prop({ default: true }) 
    showOccupation: boolean;

    @Prop({ default: false }) 
    blurPhotos: boolean;

    @Prop({ type: String, enum: Object.values(ProfileVisibility), default: ProfileVisibility.VISIBLE }) 
    profileVisibility: string;

    @Prop({ type: Date, default: Date.now }) 
    updatedAt: Date;
}

@Schema({ _id: false })
export class UserPhotoSchema {
    @Prop({ required: true }) 
    id: string;

    @Prop({ required: true })
    url: string;

    @Prop({ default: false }) 
    isPrimary: boolean;

    @Prop({ type: String, enum: Object.values(PhotoVerificationStatus), default: PhotoVerificationStatus.PENDING }) 
    status: string;

    @Prop({ default: null }) 
    faceMatchScore?: number;

    @Prop({ default: null }) 
    rejectionReason?: string;

    @Prop({ required: true, type: Date, default: Date.now }) 
    uploadedAt: Date;
}

@Schema({timestamps: true, collection: 'users'})
export class User{
    @Prop({required: true, unique: true, lowercase: true, trim: true})
    email: string;

    @Prop({
        type: String,
        default: null,
        validate: {
            validator: function(this: User, val: string | null) {
                if (this.authProvider === AuthProvider.EMAIL) {
                    return typeof val === 'string' && val.trim().length > 0;
                }
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

    @Prop({type: [Number], default: []})
    personalityVector: number[];

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

    @Prop({type: KycVerificationSchema, default: null})
    kycVerification: KycVerificationSchema;

    @Prop({type: UserProfileSchema, default: null})
    profile: UserProfileSchema;

    @Prop({type: UserPreferenceSchema, default: null})
    preference: UserPreferenceSchema;

    @Prop({ type: UserMedicalSchema, default: null })
    medicalRecord?: UserMedicalSchema;

    @Prop({ type: UserPrivacySchema, default: null })
    privacySettings?: UserPrivacySchema;

    @Prop({ type: [UserPhotoSchema], default: [] })
    photos: UserPhotoSchema[];

    createdAt: Date;
    updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);