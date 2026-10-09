import { Inject, Injectable } from "@nestjs/common";
import { 
    IApprovePhotoVerificationUseCase, 
    IClaimPhotoTaskUseCase, 
    ICreatePhotoVerificationTaskUseCase, 
    IRejectPhotoVerificationUseCase, 
    IReleasePhotoTaskClaimUseCase, 
    ITakeoverPhotoTaskClaimUseCase 
} from "../interfaces/photo-verification.use-case.interface";
import { IPhotoVerificationTaskRepository, PHOTO_VERIFICATION_TASK_REPOSITORY } from "../../domain/interfaces/photo-verification-task-repository.interface";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { PhotoVerificationTask } from "../../domain/entities/photo-verification-task.entity";
import { RejectPhotoTaskDto } from "../dtos/photo-verification.dto";

@Injectable()
export class ClaimPhotoTaskUseCase implements IClaimPhotoTaskUseCase {
    constructor(
        @Inject(PHOTO_VERIFICATION_TASK_REPOSITORY) private readonly _repository: IPhotoVerificationTaskRepository
    ) {}

    async execute(taskId: string, adminId: string): Promise<void> {
        const task = await this._repository.findById(taskId);
        if (!task) throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Task not found.');

        task.claim(adminId);
        await this._repository.update(task);
    }
}

@Injectable()
export class ReleasePhotoTaskClaimUseCase implements IReleasePhotoTaskClaimUseCase {
    constructor(
        @Inject(PHOTO_VERIFICATION_TASK_REPOSITORY) private readonly _repository: IPhotoVerificationTaskRepository
    ) {}

    async execute(taskId: string, adminId: string, isSuperAdmin: boolean): Promise<void> {
        const task = await this._repository.findById(taskId);
        if (!task) throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Task not found.');

        task.releaseClaim(adminId, isSuperAdmin);
        await this._repository.update(task);
    }
}

@Injectable()
export class TakeoverPhotoTaskClaimUseCase implements ITakeoverPhotoTaskClaimUseCase {
    constructor(
        @Inject(PHOTO_VERIFICATION_TASK_REPOSITORY) private readonly _repository: IPhotoVerificationTaskRepository
    ) {}

    async execute(taskId: string, superAdminId: string): Promise<void> {
        const task = await this._repository.findById(taskId);
        if (!task) throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Task not found.');

        task.takeoverClaim(superAdminId);
        await this._repository.update(task);
    }
}

@Injectable()
export class ApprovePhotoVerificationUseCase implements IApprovePhotoVerificationUseCase {
    constructor(
        @Inject(PHOTO_VERIFICATION_TASK_REPOSITORY) private readonly _repository: IPhotoVerificationTaskRepository
    ) {}

    async execute(taskId: string, adminId: string, isSuperAdmin: boolean): Promise<void> {
        const task = await this._repository.findById(taskId);
        if (!task) throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Task not found.');

        task.approve(adminId, isSuperAdmin);
        await this._repository.update(task);
    }
}

@Injectable()
export class RejectPhotoVerificationUseCase implements IRejectPhotoVerificationUseCase {
    constructor(
        @Inject(PHOTO_VERIFICATION_TASK_REPOSITORY) private readonly _repository: IPhotoVerificationTaskRepository
    ) {}

    async execute(taskId: string, adminId: string, isSuperAdmin: boolean, dto: RejectPhotoTaskDto): Promise<void> {
        const task = await this._repository.findById(taskId);
        if (!task) throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Task not found.');

        task.reject(adminId, isSuperAdmin, dto.reason);
        await this._repository.update(task);
    }
}

@Injectable()
export class CreatePhotoVerificationTaskUseCase implements ICreatePhotoVerificationTaskUseCase {
    constructor(
        @Inject(PHOTO_VERIFICATION_TASK_REPOSITORY) private readonly _repository: IPhotoVerificationTaskRepository
    ) {}

    async execute(targetUserId: string, photoId: string, kycSelfieUrl: string, uploadedPhotoUrl: string, faceMatchScore: number): Promise<void> {
        const exists = await this._repository.existsForPhoto(photoId);
        if (exists) return;

        const task = new PhotoVerificationTask({
            targetUserId,
            photoId,
            kycSelfieUrl,
            uploadedPhotoUrl,
            faceMatchScore
        });

        await this._repository.create(task);
    }
}