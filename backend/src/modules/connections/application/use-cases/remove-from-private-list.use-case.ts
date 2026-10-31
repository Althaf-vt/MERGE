import { Inject, Injectable } from "@nestjs/common";
import { IPrivateListRepository, PRIVATE_LIST_REPOSITORY } from "../../domain/interfaces/private-list-repository.interface";
import { IRemoveFromPrivateListUseCase } from "../interfaces/private-list.use-cases.interface";

@Injectable()
export class RemoveFromPrivateListUseCase implements IRemoveFromPrivateListUseCase {
    constructor(
        @Inject(PRIVATE_LIST_REPOSITORY) private readonly _listRepo: IPrivateListRepository,
    ) { }

    async execute(userId: string, targetUserId: string): Promise<void> {
        await this._listRepo.deleteExact(userId, targetUserId);
    }
}