import { Inject, Injectable } from "@nestjs/common";
import { IcastingUserFacade } from "../interfaces/casting-user-facade.interface";
import { CastingUserContextDto } from "../dtos/casting-user-context.dto";
import { IMarkCastingCompleteUseCase, MARK_CASTING_COMPLETE_USE_CASE } from "../interfaces/mark-casting-complete.use-case.interface";
import { GET_CASTING_USER_CONTEXT_USE_CASE, IGetCastingUserContextUseCase } from "../interfaces/get-casting-user-context.use-case.interface";

@Injectable()
export class CastingUserFacade implements IcastingUserFacade {
    constructor(
        @Inject(GET_CASTING_USER_CONTEXT_USE_CASE) private readonly _getCastingUserContextUseCase: IGetCastingUserContextUseCase,
        @Inject(MARK_CASTING_COMPLETE_USE_CASE) private readonly _markCastingCompleteUseCase: IMarkCastingCompleteUseCase,
    ) {}

    async getUserContextForCasting(userId: string): Promise<CastingUserContextDto | null> {
        return this._getCastingUserContextUseCase.execute(userId);
    }

    async markCastingComplete(userId: string, personalityVector: number[]): Promise<void> {
        return this._markCastingCompleteUseCase.execute(userId, personalityVector);
    }
}