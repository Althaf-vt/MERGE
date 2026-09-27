import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { InfectiousVisibility, ProfileVisibility } from '../../domain/enums/profile.enums';
import { Type } from 'class-transformer';

// Nested Medical Validation Classes
class FertilityRecordDto {
    @IsString() @IsNotEmpty() status!: string;
    @IsOptional() @IsString() @MaxLength(200, { message: 'Details cannot exceed 200 characters.' }) details?: string;
}

class GeneticRecordDto {
    @IsString() @IsNotEmpty() status!: string;
    @IsOptional() @IsString() @MaxLength(200, { message: 'Details cannot exceed 200 characters.' }) details?: string;
}

class InfectiousRecordDto {
    @IsString() @IsNotEmpty() hiv!: string;
    @IsString() @IsNotEmpty() hepatitis!: string;
}

class DisabilityRecordDto {
    @IsBoolean() hasDisability!: boolean;
    @IsOptional() @IsString() @MaxLength(500, { message: 'Details cannot exceed 500 characters.' }) details?: string;
}

// Main Medical DTO
export class UpdateMedicalRecordDto {
    @IsOptional() @IsString() 
    diabetes?: string;

    @IsOptional() @IsString() 
    bloodPressure?: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => FertilityRecordDto)
    fertility?: FertilityRecordDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => GeneticRecordDto)
    genetic?: GeneticRecordDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => InfectiousRecordDto)
    infectious?: InfectiousRecordDto;

    @IsOptional()
    @IsIn(Object.values(InfectiousVisibility))
    infectiousVisibility?: InfectiousVisibility;

    @IsOptional()
    @ValidateNested()
    @Type(() => DisabilityRecordDto)
    disability?: DisabilityRecordDto;
}

export class UpdatePrivacySettingsDto {
    @IsOptional()
    @IsBoolean()
    showAge?: boolean;

    @IsOptional()
    @IsBoolean()
    showOccupation?: boolean;

    @IsOptional()
    @IsBoolean()
    blurPhotos?: boolean;

    @IsOptional()
    @IsIn(Object.values(ProfileVisibility))
    profileVisibility?: ProfileVisibility;
}

export class SetPrimaryPhotoDto {
    @IsNotEmpty()
    @IsString()
    photoId!: string;
}