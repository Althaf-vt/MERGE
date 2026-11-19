export interface IUnbanUserUseCase {
    execute(userId: string): Promise<void>;
}

export const UNBAN_USER_USE_CASE = Symbol('UNBAN_USER_USE_CASE');
