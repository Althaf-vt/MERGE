export const DISCOVERY_REPOSITORY = 'DISCOVERY_REPOSITORY';

export interface DiscoveryUserContext {
    _id: unknown;
    personalityVector: number[];
    location: { type: string; coordinates: [number, number] }; // [longitude, latitude]
    preference: Record<string, unknown>;
}

export interface DiscoveryCandidateRaw {
    _id: unknown;
    profile: Record<string, unknown>;
    preference: Record<string, unknown>;
    kycVerification: Record<string, unknown>;
    photos: Array<Record<string, unknown>>;
    location: { type: string; coordinates: [number, number] };
    matchScore: number; // Derived from Atlas $meta: 'vectorSearchScore'
}

export interface VectorSearchParams {
    userContext: DiscoveryUserContext;
    isGlobal: boolean;
    excludedIds: unknown[];
    limit: number;
    skip: number;
}

export interface IDiscoveryRepository {
    getUserSearchContext(userId: string): Promise<DiscoveryUserContext | null>;
    findVectorMatches(params: VectorSearchParams): Promise<DiscoveryCandidateRaw[]>;
}