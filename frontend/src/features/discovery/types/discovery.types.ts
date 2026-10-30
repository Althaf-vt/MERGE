export interface DiscoveryRecommendationDto {
    id: string;
    displayName: string;
    customLabel?: string;
    age: number | null;
    city: string;
    state: string;
    country: string;
    distanceKm: number;
    matchScore: number;
    bio: string;
    primaryPhotoUrl: string | null;
}

export interface GetRecommendationsQuery {
    page?: number;
    limit?: number;
    isGlobal?: boolean;
}