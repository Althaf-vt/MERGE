import { DiscoveryCandidate, DiscoveryUserSearchContext, VectorSearchParams } from "./discovery.types";

export const DISCOVERY_REPOSITORY = 'DISCOVERY_REPOSITORY';

export interface IDiscoveryRepository {
    getUserSearchContext(userId: string): Promise<DiscoveryUserSearchContext | null>;
    findVectorMatches(params: VectorSearchParams): Promise<DiscoveryCandidate[]>;
}
