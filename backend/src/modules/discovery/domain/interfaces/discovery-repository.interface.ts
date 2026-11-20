import { DiscoveryCandidate, DiscoveryUserSearchContext, VectorSearchParams } from "./discovery.types";
import { DiscoveryPass } from "../entities/discovery-pass.entity";

export const DISCOVERY_REPOSITORY = 'DISCOVERY_REPOSITORY';

export interface IDiscoveryRepository {
    getUserSearchContext(userId: string): Promise<DiscoveryUserSearchContext | null>;
    findVectorMatches(params: VectorSearchParams): Promise<DiscoveryCandidate[]>;
    recordPass(pass: DiscoveryPass): Promise<void>;
    getPassedUserIds(userId: string): Promise<string[]>;
}
