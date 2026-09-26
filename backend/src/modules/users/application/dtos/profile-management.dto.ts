import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { InfectiousVisibility, ProfileVisibility } from '../../domain/enums/profile.enums';

export class UpdateMedicalRecordDto {
    @IsOptional() 
    @IsString() 
    diabetes?: string;

    @IsOptional() 
    @IsString() 
    bloodPressure?: string;

    @IsOptional() 
    @IsString() 
    fertility?: string;

    @IsOptional() 
    @IsString() 
    genetic?: string;

    @IsOptional() 
    @IsString() 
    infectious?: string;

    @IsOptional() 
    @IsIn(Object.values(InfectiousVisibility)) 
    infectiousVisibility?: InfectiousVisibility;

    @IsOptional() 
    @IsString() 
    disability?: string;
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