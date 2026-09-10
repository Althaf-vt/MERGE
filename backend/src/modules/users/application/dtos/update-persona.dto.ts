import { IsString, IsOptional, IsNumber, IsArray, IsEnum, IsNotEmpty } from 'class-validator';
import { AdoptionPreference, ImmigrationReadiness, IntersexOption, MaritalStatus, RelationshipGoal, RelationshipStatus } from '../../domain/enums/user.enums';

export class UpdatePersonaDto {
    @IsString()
    @IsNotEmpty()
    displayName!: string; 

    @IsString()
    @IsNotEmpty()
    phoneNumber!: string; 

    @IsString()
    @IsNotEmpty()
    pronouns?: string;

    @IsString()
    @IsNotEmpty()
    genderIdentity!: string; 

    @IsString()
    @IsOptional()
    customLabel?: string;

    @IsString()
    @IsNotEmpty()
    city!: string; 

    @IsString()
    @IsNotEmpty()
    state!: string; 

    @IsString()
    @IsNotEmpty()
    country!: string; 

    @IsNumber()
    @IsNotEmpty()
    heightCm!: number; 

    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty()
    languages!: string[]; 

    @IsEnum(IntersexOption)
    @IsNotEmpty()
    intersex?: IntersexOption;

    @IsNumber()
    @IsNotEmpty()
    outnessLevel?: number;

    @IsEnum(RelationshipStatus)
    @IsNotEmpty()
    relationshipStatus!: RelationshipStatus; 

    @IsEnum(RelationshipGoal)
    @IsNotEmpty()
    relationshipGoal!: RelationshipGoal; 

    @IsEnum(MaritalStatus)
    @IsNotEmpty()
    maritalStatus!: MaritalStatus; 

    @IsEnum(AdoptionPreference)
    @IsNotEmpty()
    openToAdoption!: AdoptionPreference; 

    @IsEnum(ImmigrationReadiness)
    @IsNotEmpty()
    immigrationReady!: ImmigrationReadiness; 
}