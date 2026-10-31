import { Inject, Injectable } from "@nestjs/common";
import { IDeclineConnectionUseCase } from "../interfaces/connection.use-cases.interface";
import { CONNECTION_REPOSITORY, IConnectionRepository } from "../../domain/interfaces/connection-repository.interface";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { CONNECTION_ERROR_MESSAGES } from "../../domain/constants/connection.constants";

@Injectable()
export class DeclineConnectionUseCase implements IDeclineConnectionUseCase {
    constructor(
        @Inject(CONNECTION_REPOSITORY) private readonly _connectionRepo: IConnectionRepository
    ) { }

    async execute(userId: string, connectionId: string): Promise<void> {
        const connection = await this._connectionRepo.findById(connectionId);
        if (!connection) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, CONNECTION_ERROR_MESSAGES.CONNECTION_NOT_FOUND);
        }

        connection.decline(userId);
        await this._connectionRepo.update(connection);
    }
}