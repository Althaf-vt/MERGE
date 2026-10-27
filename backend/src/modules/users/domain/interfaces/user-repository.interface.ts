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

export const USER_REPOSITORY = 'USER_REPOSITORY';

export interface IUserRepository extends IBaseRepository<UserAggregate> {
    findByEmail(email: string): Promise<UserAggregate | null>;
    findByDocumentHash(documentHash: string): Promise<UserKyc | null>;
    addLivenessResult(userId: string, record: LivenessEvaluationRecord): Promise<void>;

    saveLivenessUpdate(user: UserAggregate, record: LivenessEvaluationRecord): Promise<void>;
    
    findAllPaginated(filters: UserFilters): Promise<PaginatedResult<UserAggregate>>;
}