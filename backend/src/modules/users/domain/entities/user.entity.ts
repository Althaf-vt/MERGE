import { AuthProvider, UserStatus } from "../enums/user.enums";
import { EmailVO } from "../value-objects/email.vo";
import { UserKyc } from "./kyc-verification.entity";
import { UserPreference } from "./user-preference.entity";
import { UserProfile } from "./user-profile.entity";
import { DomainException } from "../exceptions/domain.exception";
import { ErrorCode } from "../enums/error-code.enum";

export enum UserRole{
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
    kycVerification?: UserKyc
}

// Represents the User domain entity, managing user data and 
// controlling how its state can change through domain-specific behaviors.
export class UserAggregate {
    private _props: UserAggregateProps;

    constructor(props: UserAggregateProps){
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

            lumenEnabled: props.lumenEnabled ?? true,
            dailyMatchHours: props.dailyMatchHours ?? [],
            lumenRecommendationGeneratedToday: props.lumenRecommendationGeneratedToday ?? 0,

            createdAt: props.createdAt ?? new Date(),
            updatedAt: props.updatedAt ?? new Date()
        }
    }

    // Getters : Provides read-only access to the User's provate properties.
    get id(): string | undefined {return this._props.id}
    get email(): EmailVO {return this._props.email}
    get passwordHash(): string | null | undefined {return this._props.passwordHash}
    get authProvider(): AuthProvider {return this._props.authProvider};
    get isEmailVerified(): boolean {return this._props.isEmailVerified}
    get accountStatus(): UserStatus {return this._props.accountStatus}
    get kycCompleted(): boolean {return this._props.kycCompleted}
    get onboardingStep(): number {return this._props.onboardingStep}
    get onboardingCompleted(): boolean {return this._props.onboardingCompleted}
    get profileCompleted(): boolean {return this._props.profileCompleted};
    get castingDirectorCompleted(): boolean {return this._props.castingDirectorCompleted};
    get lumenEnabled(): boolean {return this._props.lumenEnabled};
    get dailyMatchHours(): number[] {return this._props.dailyMatchHours};
    get lumenRecommendationsGeneratedToday(): number {return this._props.lumenRecommendationGeneratedToday};
    get lastLumenReset(): Date | undefined {return this._props.lastLumenReset};
    get lastLogin(): Date | undefined {return this._props.lastLogin};
    get createdAt(): Date | undefined {return this._props.createdAt};
    get updatedAt(): Date | undefined {return this._props.updatedAt};


    get profile(): UserProfile | undefined {return this._props.profile}
    get preference(): UserPreference | undefined {return this._props.preferences}
    get kycVerification(): UserKyc | undefined {return this._props.kycVerification};

    
    //1. AUTHENTICATION & ACCOUNT STATUS BEHAVIORS
    recordLogin(): void{
        if(this._props.accountStatus !== UserStatus.ACTIVE){
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

    markEmailVerified():void{
        this._props.isEmailVerified = true;
        this.markUpdatedAt();
    }

    suspendAccount(): void{
        this._props.accountStatus = UserStatus.SUSPENDED;
        this.markUpdatedAt();
    }

    banAccount(): void{
        this._props.accountStatus = UserStatus.BANNED;
        this.markUpdatedAt();
    }

        // Update KYC verification
    updateKycVerification(kycEntity: UserKyc): void{
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

    advanceOnboardingStep(step: number): void{
        if(step > this._props.onboardingStep){
            this._props.onboardingStep = step;
            this.markUpdatedAt();
        }
    }

    attachProfile(profile: UserProfile): void{
        this._props.profile = profile;
        this._props.profileCompleted = true;
        this.advanceOnboardingStep(9);
        this.markUpdatedAt();
    }

    attatchPreferences(preferences: UserPreference): void{
        this._props.preferences = preferences;
        this.advanceOnboardingStep(13);
        this.markUpdatedAt();
    }

    completeKyc(): void{
        this._props.kycCompleted = true;
        this.advanceOnboardingStep(8);
        this.markUpdatedAt();
    }

    finalizeOnboarding():void{
        if(!this._props.isEmailVerified) throw new DomainException(ErrorCode.EMAIL_NOT_VERIFIED, 'Email must be verified first');
        if(!this._props.kycCompleted) throw new DomainException(ErrorCode.VALIDATION_FAILED, 'KYC verification must be completed first');
        if(!this._props.profileCompleted) throw new DomainException(ErrorCode.VALIDATION_FAILED, 'User profile must be completed first');
        // Temporarily comment out until the feature is built
        // if(!this._props.castingDirectorCompleted) throw new Error('Casting director interview must be completed');

        this._props.onboardingCompleted = true;
        this._props.onboardingStep = 14;
        this.markUpdatedAt();
    }

    //3. LUMEN AGENT SCHEDULING & QUOTAS

    toggleLumen(enabled: boolean): void{
        this._props.lumenEnabled = enabled;
        this.markUpdatedAt();
    }

    incrementLumenRecommendations(maxDailyQuota: number): void{
        if(!this._props.lumenEnabled){
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Lumen is not enabled for this user');
        }

        if(this._props.lumenRecommendationGeneratedToday >= maxDailyQuota){
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Daily lumen quota reached');
        }

        this._props.lumenRecommendationGeneratedToday += 1;
        this.markUpdatedAt();
    }

    resetLumendailyCounters(newHours: number[]): void{
        this._props.lumenRecommendationGeneratedToday = 0;
        this._props.dailyMatchHours = newHours;
        this._props.lastLumenReset = new Date();
        this.markUpdatedAt();
    }

    markUpdatedAt(): void{
        this._props.updatedAt = new Date();
    }

    toJSON(){
        return {
            ...this._props,
            email: this._props.email.getValue(), // EmailVO needs to be unwrapped.
            profile: this._props.profile?.toJSON(),
            preference: this._props.preferences?.toJSON(),
            kycVerification: this._props.kycVerification?.toJSON(),
        }
    }
    
}
