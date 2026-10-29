import { Inject, Injectable, Logger } from "@nestjs/common";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { OnEvent } from "@nestjs/event-emitter";
import { IKycApprovedEventPayload, IKycRejectedEventPayload, IKycResubmissionRequestedEventPayload, KYC_ESCALATION_EVENTS } from "../../../../shared/domain/events/kyc-escalation-events.contract";

@Injectable()
export class AdminKycReviewListener {
    private readonly _logger = new Logger(AdminKycReviewListener.name);

    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
    ) { }

    @OnEvent(KYC_ESCALATION_EVENTS.ADMIN_KYC_RESUBMISSION_REQUESTED, { async: true })
    async handleResubmissionRequested(event: IKycResubmissionRequestedEventPayload): Promise<void> {
        this._logger.log(`Processing admin KYC resubmission request for task ${event.taskId} (User: ${event.targetUserId})`);

        const user = await this._userRepository.findById(event.targetUserId);
        if (!user || !user.kycVerification) return;

        user.kycVerification.requestResubmission({
            adminId: event.adminId || event.taskId,
            reasons: event.reasons,
            message: event.message,
        });

        await this._userRepository.update(user);
    }

    @OnEvent(KYC_ESCALATION_EVENTS.ADMIN_KYC_APPROVED, { async: true })
    async handleApproved(event: IKycApprovedEventPayload): Promise<void> {
        this._logger.log(`Processing admin KYC approval for task ${event.taskId} (User: ${event.targetUserId})`);

        const user = await this._userRepository.findById(event.targetUserId);
        if (!user || !user.kycVerification) return;

        user.kycVerification.approveManualReview({ adminId: event.adminId || event.taskId });
        user.completeKyc();
        await this._userRepository.update(user);
    }

    @OnEvent(KYC_ESCALATION_EVENTS.ADMIN_KYC_REJECTED, { async: true })
    async handleRejected(event: IKycRejectedEventPayload): Promise<void> {
        this._logger.log(`Processing admin KYC rejection for task ${event.taskId} (User: ${event.targetUserId})`);

        const user = await this._userRepository.findById(event.targetUserId);
        if (!user || !user.kycVerification) return;

        user.kycVerification.rejectManualReview({
            adminId: event.adminId || event.taskId,
            rejectionReason: event.reason
        });
        await this._userRepository.update(user);
    }
}