export const LOGOUT_USE_CASE = Symbol('LOGOUT_USE_CASE');

export interface ILogoutUseCase {
    execute(refreshToken?: string): Promise<void>;
}