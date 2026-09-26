import { ArrayMinSize, ArrayMaxSize, IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Length, Max, Min, ValidateIf } from 'class-validator';
import { HealthConditionPreference, RelationshipGoal } from '../../domain/enums/user.enums';

export class UpdateFullPreferencesDto {
    @IsArray()
    @ArrayMinSize(1, { message: 'Please select at least one identity you are looking for.' })
    @ArrayMaxSize(20, { message: 'You cannot select more than 20 identities.' })
    @IsString({ each: true })
    preferredGender!: string[];

    @IsNumber()
    @Min(18, { message: 'Minimum age must be at least 18.' })
    @Max(80, { message: 'Minimum age cannot exceed 80.' })
    preferredAgeMin!: number;

    @IsNumber()
    @Min(18, { message: 'Maximum age must be at least 18.' })
    @Max(80, { message: 'Maximum age cannot exceed 80.' })
    preferredAgeMax!: number;

    @IsEnum(RelationshipGoal, { message: 'Invalid relationship goal selected.' })
    @IsNotEmpty()
    relationshipGoals!: RelationshipGoal;

    @IsOptional()
    @IsBoolean()
    openToAdoption?: boolean;

    @IsOptional()
    @IsEnum(HealthConditionPreference)
    diabeteBpPreference?: HealthConditionPreference;

    @IsOptional()
    @IsEnum(HealthConditionPreference)
    fertilityPreference?: HealthConditionPreference;

    @IsOptional()
    @IsEnum(HealthConditionPreference)
    geneticPreference?: HealthConditionPreference;

    @IsOptional()
    @IsEnum(HealthConditionPreference)
    infectiousPreference?: HealthConditionPreference;

    @IsOptional()
    @IsEnum(HealthConditionPreference)
    disablilityPreferece?: HealthConditionPreference;

    @ValidateIf((o) => o.partnerExpectations !== undefined && o.partnerExpectations !== null && o.partnerExpectations !== '')
    @IsString()
    @Length(2, 500, { message: 'Partner expectations must be between 2 and 500 characters.' })
    partnerExpectations?: string;
}