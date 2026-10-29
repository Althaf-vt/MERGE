import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, Min } from 'class-validator';

export class GetRecommendationsQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit?: number = 20;

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    isGlobal?: boolean;
}

export interface DiscoveryRecommendationDto {
    id: string;
    displayName: string;
    customLabel?: string;
    age: number | null;
    city: string;
    state: string
    country: string;
    distanceKm: number;
    matchScore: number;
    bio: string;
    primaryPhotoUrl: string | null;
}

export interface PaginatedRecommendationsDto {
    data: DiscoveryRecommendationDto[];
    total: number;
    page: number;
    limit: number;
}