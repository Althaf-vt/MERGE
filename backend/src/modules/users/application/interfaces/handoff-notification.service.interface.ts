export const HANDOFF_NOTIFICATION_SERVICE = 'HANDOFF_NOTIFICATION_SERVICE';

export interface IHandoffNotificationService {
    notifyDesktop(sessionId: string, status: 'PHONE_CONNECTED' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED'): void;
}