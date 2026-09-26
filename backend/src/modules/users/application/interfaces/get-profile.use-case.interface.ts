export const GET_PROFILE_USE_CASE = Symbol('GET_PROFILE_USE_CASE');

export interface IGetProfileUseCase {
    execute(userId: string): Promise<any>;
}