import { EmailVO } from "../../../../shared/domain/value-objects/email.vo";

export const ADMIN_INVITE_SERVICE = 'ADMIN_INVITE_SERVICE';

export interface IAdminInviteService {
    storeInviteToken(email: EmailVO, token: string, ttlSeconds: number): Promise<void>;
    verifyAndRetriveInvite(token: string): Promise<string | null>;
    deleteInviteToken(token: string): Promise<void>;
}