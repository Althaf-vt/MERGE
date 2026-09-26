import { AuthProvider, UserStatus } from "../enums/user.enums";
import { EmailVO } from "../../../../shared/domain/value-objects/email.vo";
import { UserKyc } from "./kyc-verification.entity";
import { UserPreference } from "./user-preference.entity";
import { UserProfile } from "./user-profile.entity";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { SuspensionDurationVO } from "../value-objects/suspension-duration.vo";
import { AggregateRoot } from "../../../../shared/domain/events/aggregate-root";
import { UserSupendedDomainEvent } from "../events/user-suspended.domain-event";
import { UserBannedDomainEvent } from "../events/user-banned.domain-event";
import { PhotoVerificationStatus } from "../enums/profile.enums";
import { UserMedical } from "./user-medical.entity";
import { UserPrivacy } from "./user-privacy.entity";
import { UserPhoto } from "./user-photo.entity";

export enum UserRole {
    USER = 'USER',
    ADMIN = 'ADMIN',
    SUPER_ADMIN = 'SUPER_ADMIN',
}

// Defines the data structure and properties required to create and manage User entity.
export interface UserAggregateProps {
    id?: string;
    email: EmailVO;
    passwordHash?: string | null;
    authProvider: AuthProvider;
    isEmailVerified: boolean;
    accountStatus: UserStatus;
    kycCompleted: boolean;
    onboardingStep: number;
    onboardingCompleted: boolean;
    profileCompleted: boolean;
    castingDirectorCompleted: boolean;
    personalityVector?: number[];

    // Moderation state
    statusReason?: string | null;
    statusChangedAt?: Date | null;
    suspendedUntil?: Date | null;

    // Lumen
    lumenEnabled: boolean;
    dailyMatchHours: number[];
    lumenRecommendationGeneratedToday: number;
    lastLumenReset: Date;

    lastLogin?: Date;
    createdAt?: Date;
    updatedAt?: Date;

    // Sub-Entities (The seperate collections)
    profile?: UserProfile;
    preferences?: UserPreference;
    kycVerification?: UserKyc;
    medicalRecord?: UserMedical;
    privacySettings?: UserPrivacy;
    photos?: UserPhoto[];
}

// Represents the User domain entity, managing user data and 
// controlling how its state can change through domain-specific behaviors.
export class UserAggregate extends AggregateRoot {
    private _props: UserAggregateProps;

    constructor(props: UserAggregateProps) {
        super(); // Initialize AggregateRoot
        this._props = {
            ...props,
            authProvider: props.authProvider ?? AuthProvider.EMAIL,
            accountStatus: props.accountStatus ?? UserStatus.ACTIVE,
            isEmailVerified: props.isEmailVerified ?? false,
            kycCompleted: props.kycCompleted ?? false,
            onboardingStep: props.onboardingStep ?? 1,
            onboardingCompleted: props.onboardingCompleted ?? false,
            profileCompleted: props.profileCompleted ?? false,
            castingDirectorCompleted: props.castingDirectorCompleted ?? false,
            personalityVector: props.personalityVector ?? [],
            
            photos: props.photos ?? [],
            medicalRecord: props.medicalRecord ?? undefined,
            privacySettings: props.privacySettings ?? undefined,

            statusReason: props.statusReason ?? null,
            statusChangedAt: props.statusChangedAt ?? null,
            suspendedUntil: props.suspendedUntil ?? null,

            lumenEnabled: props.lumenEnabled ?? true,
            dailyMatchHours: props.dailyMatchHours ?? [],
            lumenRecommendationGeneratedToday: props.lumenRecommendationGeneratedToday ?? 0,

            createdAt: props.createdAt ?? new Date(),
            updatedAt: props.updatedAt ?? new Date()
        }
    }

    // Getters : Provides read-only access to the User's provate properties.
    get id(): string | undefined { return this._props.id }
    get email(): EmailVO { return this._props.email }
    get passwordHash(): string | null | undefined { return this._props.passwordHash }
    get authProvider(): AuthProvider { return this._props.authProvider };
    get isEmailVerified(): boolean { return this._props.isEmailVerified }
    get accountStatus(): UserStatus { return this._props.accountStatus }
    get kycCompleted(): boolean { return this._props.kycCompleted }
    get onboardingStep(): number { return this._props.onboardingStep }
    get onboardingCompleted(): boolean { return this._props.onboardingCompleted }
    get profileCompleted(): boolean { return this._props.profileCompleted };
    get castingDirectorCompleted(): boolean { return this._props.castingDirectorCompleted };
    get personalityVector(): number[] { return [...(this._props.personalityVector ?? [])] };

    get medicalRecord(): UserMedical | undefined { return this._props.medicalRecord; }
    get privacySettings(): UserPrivacy | undefined { return this._props.privacySettings; }
    get photos(): UserPhoto[] { return [...(this._props.photos ?? [])]; }
    get statusReason(): string | null | undefined { return this._props.statusReason; }
    get statusChangedAt(): Date | null | undefined { return this._props.statusChangedAt; }
    get suspendedUntil(): Date | null | undefined { return this._props.suspendedUntil; }

    get lumenEnabled(): boolean { return this._props.lumenEnabled };
    get dailyMatchHours(): number[] { return this._props.dailyMatchHours };
    get lumenRecommendationsGeneratedToday(): number { return this._props.lumenRecommendationGeneratedToday };
    get lastLumenReset(): Date | undefined { return this._props.lastLumenReset };
    get lastLogin(): Date | undefined { return this._props.lastLogin };
    get createdAt(): Date | undefined { return this._props.createdAt };
    get updatedAt(): Date | undefined { return this._props.updatedAt };


    get profile(): UserProfile | undefined { return this._props.profile }
    get preference(): UserPreference | undefined { return this._props.preferences }
    get kycVerification(): UserKyc | undefined { return this._props.kycVerification };


    //1. AUTHENTICATION & ACCOUNT STATUS BEHAVIORS
    recordLogin(): void {
        // Auto-lift expired suspension
        if (this._props.accountStatus === UserStatus.SUSPENDED) {
            if (this._props.suspendedUntil && new Date() > this._props.suspendedUntil) {
                this.unsuspendAccount();
            } else {
                throw new DomainException(ErrorCode.INVALID_CREDENTIALS, "Account is currently suspended");
            }
        }

        if (this._props.accountStatus !== UserStatus.ACTIVE) {
            throw new DomainException(ErrorCode.INVALID_CREDENTIALS, 'Inactive account cannot login');
        }

        this._props.lastLogin = new Date();
        this.markUpdatedAt();
    }

    updatePassword(newPasswordHash: string): void {
        if (!newPasswordHash || newPasswordHash.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Password hash cannot be empty.');
        }

        if (this._props.accountStatus !== UserStatus.ACTIVE) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, `Cannot update password for ${this._props.accountStatus.toLowerCase()} account.`);
        }

        this._props.passwordHash = newPasswordHash;
        this.markUpdatedAt();
    }

    markEmailVerified(): void {
        this._props.isEmailVerified = true;
        this.markUpdatedAt();
    }

    completeCastingDirector(vector: number[]): void{
        if(!vector || vector.length === 0){
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Personality vector cannot be empty.');
        }

        this._props.personalityVector = vector;
        this._props.castingDirectorCompleted = true;
        this.markUpdatedAt();
    }

    suspendAccount(duration: SuspensionDurationVO, reason: string): void {
        if (this._props.accountStatus === UserStatus.BANNED) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, "Cannot suspend an already banned account");
        }

        if (this._props.accountStatus === UserStatus.DELETED) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, "Cannot suspend a deleted account");
        }

        if (!reason || reason.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, "Suspension reason is required");
        }

        const now = new Date();
        this._props.accountStatus = UserStatus.SUSPENDED;
        this._props.suspendedUntil = duration.until;
        this._props.statusReason = reason.trim();
        this._props.statusChangedAt = now;
        this.markUpdatedAt();

        // Emit internal domain event
        if (this.id) {
            this.addDomainEvent(new UserSupendedDomainEvent(this.id, reason, duration.until));
        }
    }

    unsuspendAccount(): void {
        if (this._props.accountStatus !== UserStatus.SUSPENDED) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, "Account is not suspended");
        }

        this._props.accountStatus = UserStatus.ACTIVE;
        this._props.suspendedUntil = null;
        this._props.statusReason = null;
        this._props.statusChangedAt = new Date();
        this.markUpdatedAt();
    }

    banAccount(reason: string): void {
        if (this._props.accountStatus === UserStatus.DELETED) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, "Cannot ban a deleted account");
        }
        if (!reason || reason.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, "Ban reason is required");
        }

        this._props.accountStatus = UserStatus.BANNED;
        this._props.statusChangedAt = new Date();
        this._props.statusReason = reason.trim();
        // Clear any existing temporary suspension values
        this._props.suspendedUntil = null;
        this.markUpdatedAt();

        // Emit internal domain event
        if (this.id) {
            this.addDomainEvent(new UserBannedDomainEvent(this.id, reason));
        }
    }

    unbanAccount(): void {
        if (this._props.accountStatus !== UserStatus.BANNED) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, "Account is not banned");
        }

        this._props.accountStatus = UserStatus.ACTIVE;
        this._props.statusReason = null;
        this._props.statusChangedAt = new Date();
        this.markUpdatedAt();
    }

    // Update KYC verification
    updateKycVerification(kycEntity: UserKyc): void {
        this._props.kycVerification = kycEntity;
    }

    // Resets KYC verification state for retries after failure
    resetKycVerification(): void {
        if (this._props.kycVerification) {
            this._props.kycVerification.resetLiveness();
        }
        this._props.kycCompleted = false;
        this._props.onboardingStep = 3;
        this.markUpdatedAt();
    }

    //2. ONBOARDING & PIPELINE PROGRESSION

    advanceOnboardingStep(step: number): void {
        this._props.onboardingStep = step;
        this.markUpdatedAt();
    }

    attachProfile(profile: UserProfile): void {
        this._props.profile = profile;
        this.markUpdatedAt();
    }

    markProfileCompleted(): void {
        this._props.profileCompleted = true;
        this.markUpdatedAt();
    }

    attatchPreferences(preferences: UserPreference): void {
        this._props.preferences = preferences;
        this.markUpdatedAt();
    }

    completeKyc(): void {
        this._props.kycCompleted = true;
        this.advanceOnboardingStep(8);
        this.markUpdatedAt();
    }

    finalizeOnboarding(): void {
        if (!this._props.isEmailVerified) throw new DomainException(ErrorCode.EMAIL_NOT_VERIFIED, 'Email must be verified first');
        if (!this._props.kycCompleted) throw new DomainException(ErrorCode.VALIDATION_FAILED, 'KYC verification must be completed first');
        if (!this._props.profileCompleted) throw new DomainException(ErrorCode.VALIDATION_FAILED, 'User profile must be completed first');
        // Temporarily comment out until the feature is built
        // if(!this._props.castingDirectorCompleted) throw new Error('Casting director interview must be completed');

        this._props.onboardingCompleted = true;
        this._props.onboardingStep = 14;
        this.markUpdatedAt();
    }


    attachMedicalRecord(medical: UserMedical): void{
        this._props.medicalRecord = medical;
        this.markUpdatedAt();
    }

    attachPrivacySettings(privacy: UserPrivacy): void{
        this._props.privacySettings = privacy;
        this.markUpdatedAt();
    }

    addPhoto(photo: UserPhoto): void{
        if(this._props.photos && this._props.photos.length >= 6){
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Maximum of 6 photos allowed.');
        }
        this._props.photos?.push(photo);
        this.markUpdatedAt();
    }

    setPrimaryPhoto(photoId: string): void{
        if(!this._props.photos) return;

        const photoExists = this._props.photos.find(p => p.id === photoId);
        if (!photoExists) throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Photo not found.');

        if(photoExists.status !== PhotoVerificationStatus.APPROVED){
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Only approved photos can be set as primary.');
        }

        this._props.photos.forEach(p => {
            if(p.id === photoId){
                p.markAsPrimary();
            }else{
                p.removePrimaryStatus();
            }
        })

        this.markUpdatedAt();
    }

    removePhoto(photoId: string): void{
        if(!this._props.photos) return;
        this._props.photos = this._props.photos.filter(p => p.id !== photoId);
        this.markUpdatedAt();
    }

    validatePhotoLimit(): void {
        if (this._props.photos && this._props.photos.length >= 6) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'You have reached the maximum limit of 6 photos.');
        }
    }

    //3. LUMEN AGENT SCHEDULING & QUOTAS

    toggleLumen(enabled: boolean): void {
        this._props.lumenEnabled = enabled;
        this.markUpdatedAt();
    }

    incrementLumenRecommendations(maxDailyQuota: number): void {
        if (!this._props.lumenEnabled) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Lumen is not enabled for this user');
        }

        if (this._props.lumenRecommendationGeneratedToday >= maxDailyQuota) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Daily lumen quota reached');
        }

        this._props.lumenRecommendationGeneratedToday += 1;
        this.markUpdatedAt();
    }

    resetLumendailyCounters(newHours: number[]): void {
        this._props.lumenRecommendationGeneratedToday = 0;
        this._props.dailyMatchHours = newHours;
        this._props.lastLumenReset = new Date();
        this.markUpdatedAt();
    }

    markUpdatedAt(): void {
        this._props.updatedAt = new Date();
    }

    toJSON() {
        return {
            ...this._props,
            email: this._props.email.getValue(), // EmailVO needs to be unwrapped.
            profile: this._props.profile?.toJSON(),
            preference: this._props.preferences?.toJSON(),
            kycVerification: this._props.kycVerification?.toJSON(),
            medicalRecord: this._props.medicalRecord?.toJSON(),
            privacySettings: this._props.privacySettings?.toJSON(),
            photos: this._props.photos?.map(p => p.toJSON()),
        }
    }
}
