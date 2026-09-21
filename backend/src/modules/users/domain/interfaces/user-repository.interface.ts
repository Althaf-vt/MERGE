import { LivenessEvaluationRecord, UserKyc } from "../entities/kyc-verification.entity";
import { UserAggregate } from "../entities/user.entity";
import { IBaseRepository } from "../../../../shared/domain/interfaces/base-repository.interface";
import { UserStatus } from "../enums/user.enums";

// Pagination types for Admin Management
export interface UserFilters {
    page: number;
    limit: number;
    search?: string;
    status?: UserStatus;
    kycStatus?: string;
}

export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}

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

    findAllPaginated(filters: UserFilters): Promise<PaginatedResult<UserAggregate>>;
}