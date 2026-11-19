export const ADMIN_APP_CONFIG = Symbol('ADMIN_APP_CONFIG');

export interface IAdminAppConfig {
    readonly refreshExpirationSeconds: number;
    readonly inviteTtlSeconds: number;
}
