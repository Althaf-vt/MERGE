export interface IBanUserUseCase {
    execute(userId: string, reason: string): Promise<void>;
}

export const BAN_USER_USE_CASE = Symbol('BAN_USER_USE_CASE');
