export interface IMarkCastingCompleteUseCase {
    execute(userId: string, personalityVector: number[]): Promise<void>;
}

export const MARK_CASTING_COMPLETE_USE_CASE = Symbol('MARK_CASTING_COMPLETE_USE_CASE');
