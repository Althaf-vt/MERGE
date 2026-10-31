import { IBaseRepository } from "../../../../shared/domain/interfaces/base-repository.interface";
import { ConnectionAggregate } from "../entities/connection.entity";
import { ConnectionRole, ConnectionStatus } from "../enums/connection.enums";

export const CONNECTION_REPOSITORY = 'CONNECTION_REPOSITORY';

export interface GetConnectionsFilters {
    userId: string;
    statuses: ConnectionStatus[];
    page: number;
    limit: number;
    role: ConnectionRole;
}

export interface PaginatedConnectionsResult {
    data: ConnectionAggregate[];
    total: number;
}

export interface IConnectionRepository extends IBaseRepository<ConnectionAggregate> {
    findExistingInteraction(userIdA: string, userIdB: string): Promise<ConnectionAggregate | null>;
    findPendingRequest(requesterId: string, recipientId: string): Promise<ConnectionAggregate | null>;
    getPaginatedByStatus(filters: GetConnectionsFilters): Promise<PaginatedConnectionsResult>;
}