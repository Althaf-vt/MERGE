import { UserAggregate, UserRole, KycStatus } from "../../../domain/entities/user.entity";
import { AuthProvider, UserStatus } from "../../../domain/enums/user.enums";
import { EmailVO } from "../../../domain/value-objects/email.vo";
import { UserDocument } from "../user.schema";

// Maps between domain UserEntity objects and Mongoose persistence documents.
export class UserPersistenceMapper{

    // Converts a MongoDB/Mongoose User document into a domain UserEntity.
    public static toDomain(raw: UserDocument): UserAggregate{
        return new UserAggregate({
            id: raw._id.toString(),
            email: new EmailVO(raw.email),
            passwordHash: raw.passwordHash,
            authProvider: (raw.authProvider as AuthProvider) ?? AuthProvider.EMAIL,
            isEmailVerified: raw.isEmailVerified,
            kycCompleted: raw.kycCompleted,
            accountStatus: (raw.accountStatus as UserStatus) ?? UserStatus.ACTIVE,
            onboardingStep: raw.onboardingStep,
            onboardingCompleted: raw.onboardingCompleted ?? false,
            profileCompleted: raw.profileCompleted ?? false,
            castingDirectorCompleted: raw.castingDirectorCompleted ?? false,
            lumenEnabled: raw.lumenEnabled ?? true,
            dailyMatchHours: raw.dailyMatchHours ?? [],
            lumenRecommendationGeneratedToday: raw.lumenRecommendationGeneratedToday ?? 0,
            lastLumenReset: raw.lastLumenReset ?? new Date(),
            lastLogin: raw.lastLogin,
            createdAt: raw['createdAt'],
            updatedAt: raw['updatedAt']
        });
    }

    // Converts a domain UserEntity into a plain object that can be stored in MongoDB.
    public static toPersistence(entity: UserAggregate): any{
        const data = entity.toJSON();
        return{
            email: data.email,
            passwordHash: data.passwordHash,
            authProvider: data.authProvider,
            isEmailVerified: data.isEmailVerified,
            kycCompleted: data.kycCompleted,
            accountStatus: data.accountStatus,
            onboardingStep: data.onboardingStep,
            onboardingCompleted: data.onboardingCompleted,
            profileCompleted: data.profileCompleted,
            castingDirectorCompleted: data.castingDirectorCompleted,
            lumenEnabled: data.lumenEnabled,
            dailyMatchHours: data.dailyMatchHours,
            lumenRecommendationGeneratedToday: data.lumenRecommendationGeneratedToday,
            lastLumenReset: data.lastLumenReset,
            lastLogin: data.lastLogin
        }
    }
}