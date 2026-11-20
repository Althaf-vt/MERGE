import { Inject, Injectable } from "@nestjs/common";
import { IConnectionsFacade } from "../interfaces/connections-facade.interface";
import { GET_INTERACTED_USER_IDS_USE_CASE, IGetInteractedUserIdsUseCase } from "../interfaces/get-interacted-user-ids.use-case.interface";

@Injectable()
export class ConnectionsFacade implements IConnectionsFacade {
    constructor(
        @Inject(GET_INTERACTED_USER_IDS_USE_CASE) private readonly _getInteractedUserIdsUseCase: IGetInteractedUserIdsUseCase,
    ) { }

    async getInteractedUserIds(userId: string): Promise<string[]> {
        return this._getInteractedUserIdsUseCase.execute(userId);
    }
}