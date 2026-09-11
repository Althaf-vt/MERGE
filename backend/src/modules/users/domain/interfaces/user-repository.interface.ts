import { LivenessEvaluationRecord, UserKyc } from "../entities/kyc-verification.entity";
import { UserAggregate } from "../entities/user.entity";
import { IBaseRepository } from "./base-repository.interface";

// Unique DI token used to identify the UserRepository implementation.
// String token instead of Symbol for reliable Cross-Module Dependency Injection
export const USER_REPOSITORY = 'USER_REPOSITORY';

// Defines the contracts for accessing and managing User data.
// Keeps the application independent of the database implementation.
// Extends the base repository to inherit findById, create, and update
export interface IUserRepository extends IBaseRepository<UserAggregate> {
    findByEmail(email: string): Promise<UserAggregate | null>;
    findByDocumentHash(documentHash: string): Promise<UserKyc | null>;
    addLivenessResult(userId: string, record: LivenessEvaluationRecord): Promise<void>;
}