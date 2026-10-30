import { Inject, Injectable } from "@nestjs/common";
import { CONNECTION_REPOSITORY, IConnectionRepository } from "../../domain/interfaces/connection-repository.interface";
import { IAcceptConnectionUseCase } from "../interfaces/connection.use-cases.interface";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";

@Injectable()
export class AcceptConnectionUseCase implements IAcceptConnectionUseCase {
    constructor(
        @Inject(CONNECTION_REPOSITORY) private readonly _connectionRepo: IConnectionRepository,
    ) { }

    async execute(userId: string, connectionId: string): Promise<void> {
        const connection = await this._connectionRepo.findById(connectionId);
        if (!connection) throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Connection request not found.');

        connection.accept(userId);
        await this._connectionRepo.update(connection);
    }
}

