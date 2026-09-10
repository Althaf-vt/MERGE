import { ArrayMinSize, IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { RelationshipGoal } from '../../domain/enums/user.enums';

export class UpdatePreferencesDto {
    @IsArray()
    @ArrayMinSize(1, { message: 'Select at least one identity.' })
    @IsString({ each: true })
    @IsNotEmpty()
    preferredGender!: string[];

    @IsNumber()
    @Min(18)
    @Max(100)
    @IsNotEmpty()
    preferredAgeMin!: number;

    @IsNumber()
    @Min(18)
    @Max(100)
    @IsNotEmpty()
    preferredAgeMax!: number;

    @IsEnum(RelationshipGoal)
    @IsNotEmpty()
    relationshipGoals!: RelationshipGoal;

    @IsNumber()
    @Min(1)
    @Max(5)
    @IsNotEmpty()
    minimumOutnessLevel!: number;

    @IsBoolean()
    @IsNotEmpty()
    openToAdoption!: boolean;

    @IsBoolean()
    @IsNotEmpty()
    immigrationReady!: boolean;

    @IsString()
    @IsOptional()
    partnerExpectations?: string;
}