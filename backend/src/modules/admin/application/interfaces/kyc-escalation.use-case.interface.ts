import { KycEscalationTask } from "../../domain/entities/kyc-escalation-task.entity";
import { GetKycTasksQueryDto, RejectKycTaskDto, RequestKycResubmissionDto } from "../dtos/kyc-escalation.dto";

export const GET_KYC_TASKS_USE_CASE = 'GET_KYC_TASKS_USE_CASE';
export const CLAIM_KYC_TASK_USE_CASE = 'CLAIM_KYC_TASK_USE_CASE';
export const RELEASE_KYC_TASK_CLAIM_USE_CASE = 'RELEASE_KYC_TASK_CLAIM_USE_CASE';
export const TAKEOVER_KYC_TASK_CLAIM_USE_CASE = 'TAKEOVER_KYC_TASK_CLAIM_USE_CASE';
export const APPROVE_KYC_TASK_USE_CASE = 'APPROVE_KYC_TASK_USE_CASE';
export const REJECT_KYC_TASK_USE_CASE = 'REJECT_KYC_TASK_USE_CASE';
export const REQUEST_RESUBMISSION_KYC_TASK_USE_CASE = 'REQUEST_RESUBMISSION_KYC_TASK_USE_CASE';

export interface HydratedKycTaskResult {
    task: KycEscalationTask;
    signedSelfieUrl: string;
    signedDocumentUrl: string;
}

export interface PaginatedHydratedKycTasks {
    data: HydratedKycTaskResult[];
    total: number;
    page: number;
    limit: number;
}

export interface IGetKycTasksUseCase {
    execute(query: GetKycTasksQueryDto): Promise<PaginatedHydratedKycTasks>;
}

export interface IClaimKycTaskUseCase {
    execute(taskId: string, adminId: string): Promise<void>;
}

export interface IReleaseKycTaskClaimUseCase {
    execute(taskId: string, adminId: string, role: string): Promise<void>;
}

export interface ITakeoverKycTaskClaimUseCase {
    execute(taskId: string, superAdminId: string): Promise<void>;
}

export interface IApproveKycTaskUseCase {
    execute(taskId: string, adminId: string, role: string): Promise<void>;
}

export interface IRejectKycTaskUseCase {
    execute(taskId: string, adminId: string, role: string, dto: RejectKycTaskDto): Promise<void>;
}

export interface IRequestKycResubmissionUseCase {
    execute(taskId: string, adminId: string, role: string, dto: RequestKycResubmissionDto): Promise<void>;
}