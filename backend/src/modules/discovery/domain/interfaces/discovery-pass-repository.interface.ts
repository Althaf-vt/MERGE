import { DiscoveryPass } from "../entities/discovery-pass.entity";

export const DISCOVERY_PASS_REPOSITORY = 'DISCOVERY_PASS_REPOSITORY';

export interface IDiscoveryPassRepository {
    recordPass(pass: DiscoveryPass): Promise<void>;
    getPassedUserIds(userId: string): Promise<string[]>;
}
