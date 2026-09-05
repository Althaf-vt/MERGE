import { AuthProvider, UserStatus } from "../enums/user.enums";
import { EmailVO } from "../value-objects/email.vo";
import { UserKyc } from "./kyc-verification.entity";
import { UserPreference } from "./user-preference.entity";
import { UserProfile } from "./user-profile.entity";

export enum UserRole{
    USER = 'USER',
    ADMIN = 'ADMIN',
    SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum KycStatus {
    NOT_STARTED = 'NOT_STARTED',
    PENDING = 'PENDING',
    VERIFIED = 'VERIFIED',
    REJECTED = 'REJECTED',
    UNDER_REVIEW = 'UNDER_REVIEW'
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
    private props: UserAggregateProps;

    constructor(props: UserAggregateProps){
        this.props = {
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
    get id(): string | undefined {return this.props.id}
    get email(): EmailVO {return this.props.email}
    get passwordHash(): string | null | undefined {return this.props.passwordHash}
    get authProvider(): AuthProvider {return this.props.authProvider};
    get isEmailVerified(): boolean {return this.props.isEmailVerified}
    get accountStatus(): UserStatus {return this.props.accountStatus}
    get kycCompleted(): boolean {return this.props.kycCompleted}
    get onboardingStep(): number {return this.props.onboardingStep}
    get onboardingCompleted(): boolean {return this.props.onboardingCompleted}
    get profileCompleted(): boolean {return this.props.profileCompleted};
    get castingDirectorCompleted(): boolean {return this.props.castingDirectorCompleted};
    get lumenEnabled(): boolean {return this.props.lumenEnabled};
    get dailyMatchHours(): number[] {return this.props.dailyMatchHours};
    get lumenRecommendationsGeneratedToday(): number {return this.props.lumenRecommendationGeneratedToday};
    get lastLumenReset(): Date | undefined {return this.props.lastLumenReset};
    get lastLogin(): Date | undefined {return this.props.lastLogin};
    get createdAt(): Date | undefined {return this.props.createdAt};
    get updatedAt(): Date | undefined {return this.props.updatedAt};


    get profile(): UserProfile | undefined {return this.props.profile}
    get preference(): UserPreference | undefined {return this.props.preferences}
    get kycVerification(): UserKyc | undefined {return this.props.kycVerification};

    
    //1. AUTHENTICATION & ACCOUNT STATUS BEHAVIORS
    recordLogin(): void{
        if(this.props.accountStatus !== UserStatus.ACTIVE){
            throw new Error('Inactive account cannot login');
        }

        this.props.lastLogin = new Date();
        this.markUpdatedAt();
    }

    markEmailVerified():void{
        this.props.isEmailVerified = true;
        this.markUpdatedAt();
    }

    suspendAccount(): void{
        this.props.accountStatus = UserStatus.SUSPENDED;
        this.markUpdatedAt();
    }

    banAccount(): void{
        this.props.accountStatus = UserStatus.BANNED;
        this.markUpdatedAt();
    }

        // Update KYC verification
    updateKycVerification(kycEntity: UserKyc): void{
        this.props.kycVerification = kycEntity;
    }

    //2. ONBOARDING & PIPELINE PROGRESSION

    advanceOnboardingStep(step: number): void{
        if(step > this.props.onboardingStep){
            this.props.onboardingStep = step;
            this.markUpdatedAt();
        }
    }

    attachProfile(profile: UserProfile): void{
        this.props.profile = profile;
        this.props.profileCompleted = true;
        this.advanceOnboardingStep(9);
        this.markUpdatedAt();
    }

    attatchPreferences(preferences: UserPreference): void{
        this.props.preferences = preferences;
        this.advanceOnboardingStep(13);
        this.markUpdatedAt();
    }

    completeKyc(): void{
        this.props.kycCompleted = true;
        this.advanceOnboardingStep(8);
        this.markUpdatedAt();
    }

    finalizeOnboarding():void{
        if(!this.props.isEmailVerified) throw new Error('Email must verified first');
        if(!this.props.kycCompleted) throw new Error('KYC verification must be completed first');
        if(!this.props.profileCompleted) throw new Error('User profile must be completed first');
        if(!this.props.castingDirectorCompleted) throw new Error('Casting director interview must be completed');

        this.props.onboardingCompleted = true;
        this.props.onboardingStep = 14;
        this.markUpdatedAt();
    }

    //3. LUMEN AGENT SCHEDULING & QUOTAS

    toggleLumen(enabled: boolean): void{
        this.props.lumenEnabled = enabled;
        this.markUpdatedAt();
    }

    incrementLumenRecommendations(maxDailyQuota: number): void{
        if(!this.props.lumenEnabled){
            throw new Error('Lumen is not enabled for this user');
        }

        if(this.props.lumenRecommendationGeneratedToday >= maxDailyQuota){
            throw new Error('Daily lumen quota reached');
        }

        this.props.lumenRecommendationGeneratedToday += 1;
        this.markUpdatedAt();
    }

    resetLumendailyCounters(newHours: number[]): void{
        this.props.lumenRecommendationGeneratedToday = 0;
        this.props.dailyMatchHours = newHours;
        this.props.lastLumenReset = new Date();
        this.markUpdatedAt();
    }

    markUpdatedAt(): void{
        this.props.updatedAt = new Date();
    }

    toJSON(){
        return {
            ...this.props,
            email: this.props.email.getValue(), // EmailVO needs to be unwrapped.
            profile: this.props.profile?.toJSON(),
            preference: this.props.preferences?.toJSON(),
            kycVerification: this.props.kycVerification?.toJSON(),
        }
    }
    
}
