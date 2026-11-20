export const GET_INTERACTED_USER_IDS_USE_CASE = 'GET_INTERACTED_USER_IDS_USE_CASE';

export interface IGetInteractedUserIdsUseCase {
    execute(userId: string): Promise<string[]>;
}
