import { Types } from "mongoose";
import { DiscoveryCandidate, DiscoveryUserSearchContext } from "../../../domain/interfaces/discovery.types";
import { DiscoveryPass } from "../../../domain/entities/discovery-pass.entity";
import { DiscoveryPassSnapshot } from "../../../domain/interfaces/discovery-pass.types";

export class DiscoveryPersistenceMapper {
    public static toDomainUserSearchContext(raw: Record<string, unknown>): DiscoveryUserSearchContext {
        const id = raw._id instanceof Types.ObjectId ? raw._id.toHexString() : String(raw._id);
        return {
            id,
            personalityVector: (raw.personalityVector as number[]) || [],
            location: raw.location as DiscoveryUserSearchContext['location'],
            preference: raw.preference as DiscoveryUserSearchContext['preference'],
        };
    }

    public static toDomainCandidate(raw: Record<string, unknown>): DiscoveryCandidate {
        const id = raw._id instanceof Types.ObjectId ? raw._id.toHexString() : String(raw._id);
        return {
            id,
            profile: raw.profile as DiscoveryCandidate['profile'],
            preference: raw.preference as DiscoveryCandidate['preference'],
            kycVerification: raw.kycVerification as DiscoveryCandidate['kycVerification'],
            photos: raw.photos as DiscoveryCandidate['photos'],
            location: raw.location as DiscoveryCandidate['location'],
            matchScore: (raw.matchScore as number) ?? 0,
        };
    }

    public static toDomainCandidateList(rawList: Record<string, unknown>[]): DiscoveryCandidate[] {
        return rawList.map(raw => DiscoveryPersistenceMapper.toDomainCandidate(raw));
    }

    public static toPersistencePass(entity: DiscoveryPass): DiscoveryPassSnapshot {
        return entity.toJSON();
    }
}
