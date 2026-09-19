import { Inject, Injectable } from "@nestjs/common";
import { IManageUserStatusUseCase } from "../interfaces/manage-user-status.use-case.interface";
import { IUserManagementFacade, USER_MANAGEMENT_FACADE } from "../../../users/application/interfaces/user-management-facade.interface";
import { IModerationLogRepository, MODERATION_LOG_REPOSITORY } from "../../domain/interfaces/moderation-log-repository.interface";
import { SuspensionUnit } from "../../../users/domain/value-objects/suspension-duration.vo";
import {  ModerationLog } from "../../domain/entities/moderation-log.entity";
import { ModerationAction } from "../../domain/enums/moderation.enums";

@Injectable()
export class ManageUserStatusUseCase implements IManageUserStatusUseCase {
    constructor(
        @Inject(USER_MANAGEMENT_FACADE) private readonly _userFacade: IUserManagementFacade,
        @Inject(MODERATION_LOG_REPOSITORY) private readonly _moderationLogRepo: IModerationLogRepository,
    ) { }

    async suspendUser(adminId: string, targetUserId: string, duration: number, unit: SuspensionUnit, reason: string): Promise<void> {
        // 1. Facade calls User module (which saves user and dispatched EDA events)
        await this._userFacade.suspendUser(targetUserId, duration, unit, reason);

        // 2. Local module handles audit trial
        const log = new ModerationLog({
            adminId,
            targetUserId,
            action: ModerationAction.SUSPEND,
            reason,
            durationContext: `${duration} ${unit}`,
        });
        await this._moderationLogRepo.save(log);
    }

    async unsuspendUser(adminId: string, targetUserId: string, reason: string): Promise<void> {
        await this._userFacade.unsuspendUser(targetUserId);

        const log = new ModerationLog({
            adminId,
            targetUserId,
            action: ModerationAction.UNSUSPEND,
            reason,
        });
        await this._moderationLogRepo.save(log);
    }

    async banUser(adminId: string, targetUserId: string, reason: string): Promise<void> {
        await this._userFacade.banUser(targetUserId, reason);

        const log = new ModerationLog({
            adminId,
            targetUserId,
            action: ModerationAction.BAN,
            reason,
            durationContext: 'INDEFINITE',
        });
        await this._moderationLogRepo.save(log);
    }

    async unbanUser(adminId: string, targetUserId: string, reason: string): Promise<void> {
        await this._userFacade.unbanUser(targetUserId);

        const log = new ModerationLog({
            adminId,
            targetUserId,
            action: ModerationAction.UNBAN,
            reason,
        });
        await this._moderationLogRepo.save(log);
    }
}