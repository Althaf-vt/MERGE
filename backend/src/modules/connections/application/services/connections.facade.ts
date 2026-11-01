import { Inject, Injectable } from "@nestjs/common";
import { IConnectionsFacade } from "../interfaces/connections-facade.interface";
import { CONNECTION_REPOSITORY, IConnectionRepository } from "../../domain/interfaces/connection-repository.interface";
import { IPrivateListRepository, PRIVATE_LIST_REPOSITORY } from "../../domain/interfaces/private-list-repository.interface";
import { IPriorityIntroRepository, PRIORITY_INTRO_REPOSITORY } from "../../domain/interfaces/priority-intro-repository.interface";

@Injectable()
export class ConnectionsFacade implements IConnectionsFacade {
    constructor(
        @Inject(CONNECTION_REPOSITORY) private readonly _connectionRepo: IConnectionRepository,
        @Inject(PRIVATE_LIST_REPOSITORY) private readonly _listRepo: IPrivateListRepository,
        @Inject(PRIORITY_INTRO_REPOSITORY) private readonly _introRepo: IPriorityIntroRepository,
    ) {}

    async getInteractedUserIds(userId: string): Promise<string[]> {
        const [connectionPartnerIds, listTargetIds, introPartnerIds] = await Promise.all([
            this._connectionRepo.findInteractedUserIds(userId),
            this._listRepo.findTargetUserIds(userId),
            this._introRepo.findInteractedUserIds(userId),
        ]);

        const uniqueIds = new Set<string>([
            ...connectionPartnerIds,
            ...listTargetIds,
            ...introPartnerIds,
        ]);

        return Array.from(uniqueIds);
    }
}