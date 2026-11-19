export interface IUnsuspendUserUseCase {
    execute(userId: string): Promise<void>;
}

export const UNSUSPEND_USER_USE_CASE = Symbol('UNSUSPEND_USER_USE_CASE');
