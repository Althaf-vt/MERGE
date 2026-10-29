import { IBaseRepository } from "../../../../shared/domain/interfaces/base-repository.interface";
import { KycEscalationTask } from "../entities/kyc-escalation-task.entity";
import { ClaimStatus } from "../enums/claim-status.enum";
import { KycTaskStatus } from "../enums/kyc-task-status.enum";

export const KYC_ESCALATION_TASK_REPOSITORY = 'KYC_ESCALATION_TASK_REPOSITORY';

export interface GetKycTasksFilters {
    page: number;
    limit: number;
    status?: KycTaskStatus;
    claimStatus?: ClaimStatus;
    claimedBy?: string;
}

export interface PaginatedKycTaskResult{
    data: KycEscalationTask[];
    total: number;
    page: number;
    limit: number;
}

export interface IKycEscalationTaskRepository extends IBaseRepository<KycEscalationTask>{
    findAllPaginated(filters: GetKycTasksFilters): Promise<PaginatedKycTaskResult>;
    existsForUser(targetUserId: string): Promise<boolean>;
}