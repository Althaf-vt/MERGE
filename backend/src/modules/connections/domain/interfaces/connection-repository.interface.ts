import { IBaseRepository } from "../../../../shared/domain/interfaces/base-repository.interface";
import { ConnectionAggregate } from "../entities/connection.entity";
import { ConnectionStatus } from "../enums/connection.enums";

export const CONNECTION_REPOSITORY = 'CONNECTION_REPOSITORY';

export interface IConnectionRepository extends IBaseRepository<ConnectionAggregate> {
    findExistingInteraction(userIdA: string, userIdB: string): Promise<ConnectionAggregate | null>;
    findPendingRequest(requesterId: string, recipientId: string): Promise<ConnectionAggregate | null>;
    getPaginatedByStatus(userId: string, statuses: ConnectionStatus[], page: number, limit: number, role: 'REQUESTER' | 'RECIPIENT' | 'BOTH'): Promise<{ data: ConnectionAggregate[]; total: number }>;
}