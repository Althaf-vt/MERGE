import { HandoffStatus } from "../../domain/enums/user.enums";

export const HANDOFF_NOTIFICATION_SERVICE = 'HANDOFF_NOTIFICATION_SERVICE';

export interface IHandoffNotificationService {
    notifyDesktop(sessionId: string, status: HandoffStatus): void;
}