export const DISCOVERY_REPOSITORY = 'DISCOVERY_REPOSITORY';

export interface DiscoveryGeoLocation {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
}

export interface DiscoveryCandidateProfile {
    displayName?: string;
    customLabel?: string;
    bio?: string;
    city?: string;
    state?: string;
    country?: string;
}

export interface DiscoveryCandidatePreference {
    immigrationReady?: boolean;
}

export interface DiscoveryCandidateKyc {
    verifiedDOB?: Date | string;
}

export interface DiscoveryCandidatePhoto {
    url?: string;
    isPrimary?: boolean;
    status?: string;
}

export interface DiscoveryUserContext {
    _id: string | { toString(): string };
    personalityVector: number[];
    location: DiscoveryGeoLocation;
    preference?: DiscoveryCandidatePreference;
}

export interface DiscoveryCandidateRaw {
    _id: string | { toString(): string };
    profile?: DiscoveryCandidateProfile;
    preference?: DiscoveryCandidatePreference;
    kycVerification?: DiscoveryCandidateKyc;
    photos?: DiscoveryCandidatePhoto[];
    location: DiscoveryGeoLocation;
    matchScore: number; // Derived from Atlas $meta: 'vectorSearchScore'
}

export interface VectorSearchParams {
    userContext: DiscoveryUserContext;
    isGlobal: boolean;
    excludedIds: string[];
    limit: number;
    skip: number;
}

export interface IDiscoveryRepository {
    getUserSearchContext(userId: string): Promise<DiscoveryUserContext | null>;
    findVectorMatches(params: VectorSearchParams): Promise<DiscoveryCandidateRaw[]>;
}
