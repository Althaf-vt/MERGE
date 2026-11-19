export interface IUserAppConfig {
    readonly frontendUrl: string;
    readonly sessionTtlSeconds: number;
}

export const USER_APP_CONFIG = Symbol('USER_APP_CONFIG');
