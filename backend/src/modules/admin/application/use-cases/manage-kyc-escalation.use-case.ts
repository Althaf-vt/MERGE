import { Inject, Injectable } from "@nestjs/common";
import {
    IApproveKycTaskUseCase,
    IClaimKycTaskUseCase,
    IRejectKycTaskUseCase,
    IReleaseKycTaskClaimUseCase,
    IRequestKycResubmissionUseCase,
    ITakeoverKycTaskClaimUseCase
} from "../interfaces/kyc-escalation.use-case.interface";
import { IKycEscalationTaskRepository, KYC_ESCALATION_TASK_REPOSITORY } from "../../domain/interfaces/kyc-escalation-task-repository.interface";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { RejectKycTaskDto, RequestKycResubmissionDto } from "../dtos/kyc-escalation.dto";
import { AdminRole } from "../../domain/enums/admin.enums";

@Injectable()
export class ClaimKycTaskUseCase implements IClaimKycTaskUseCase {
    constructor(
        @Inject(KYC_ESCALATION_TASK_REPOSITORY) private readonly _repository: IKycEscalationTaskRepository
    ) { }

    async execute(taskId: string, adminId: string): Promise<void> {
        const task = await this._repository.findById(taskId);
        if (!task) throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Task not found.');

        task.claim(adminId);
        await this._repository.update(task);
    }
}

@Injectable()
export class ReleaseKycTaskClaimUseCase implements IReleaseKycTaskClaimUseCase {
    constructor(
        @Inject(KYC_ESCALATION_TASK_REPOSITORY) private readonly _repository: IKycEscalationTaskRepository
    ) { }

    async execute(taskId: string, adminId: string, role: string): Promise<void> {
        const task = await this._repository.findById(taskId);
        if (!task) throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Task not found.');

        const isSuperAdmin = role === AdminRole.SUPER_ADMIN;
        task.releaseClaim(adminId, isSuperAdmin);
        await this._repository.update(task);
    }
}

@Injectable()
export class TakeoverKycTaskClaimUseCase implements ITakeoverKycTaskClaimUseCase {
    constructor(
        @Inject(KYC_ESCALATION_TASK_REPOSITORY) private readonly _repository: IKycEscalationTaskRepository
    ) { }

    async execute(taskId: string, superAdminId: string): Promise<void> {
        const task = await this._repository.findById(taskId);
        if (!task) throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Task not found.');

        task.takeoverClaim(superAdminId);
        await this._repository.update(task);
    }
}

@Injectable()
export class ApproveKycTaskUseCase implements IApproveKycTaskUseCase {
    constructor(
        @Inject(KYC_ESCALATION_TASK_REPOSITORY) private readonly _repository: IKycEscalationTaskRepository
    ) { }

    async execute(taskId: string, adminId: string, role: string): Promise<void> {
        const task = await this._repository.findById(taskId);
        if (!task) throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Task not found.');

        const isSuperAdmin = role === AdminRole.SUPER_ADMIN;
        task.approve(adminId, isSuperAdmin);
        await this._repository.update(task);
    }
}

@Injectable()
export class RejectKycTaskUseCase implements IRejectKycTaskUseCase {
    constructor(
        @Inject(KYC_ESCALATION_TASK_REPOSITORY) private readonly _repository: IKycEscalationTaskRepository
    ) { }

    async execute(taskId: string, adminId: string, role: string, dto: RejectKycTaskDto): Promise<void> {
        const task = await this._repository.findById(taskId);
        if (!task) throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Task not found.');

        const isSuperAdmin = role === AdminRole.SUPER_ADMIN;
        task.reject(adminId, isSuperAdmin, dto.reason);
        await this._repository.update(task);
    }
}

@Injectable()
export class RequestKycResubmissionUseCase implements IRequestKycResubmissionUseCase {
    constructor(
        @Inject(KYC_ESCALATION_TASK_REPOSITORY) private readonly _repository: IKycEscalationTaskRepository
    ) { }

    async execute(taskId: string, adminId: string, role: string, dto: RequestKycResubmissionDto): Promise<void> {
        const task = await this._repository.findById(taskId);
        if (!task) throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Task not found.');

        const isSuperAdmin = role === AdminRole.SUPER_ADMIN;
        task.requestResubmission(adminId, isSuperAdmin, dto.reasons, dto.message);
        await this._repository.update(task);
    }
}