import { 
  IsString, 
  IsOptional, 
  IsNumber, 
  IsArray, 
  IsEnum, 
  IsNotEmpty, 
  Matches, 
  Min, 
  Max, 
  ArrayMinSize, 
  IsIn, 
  Length
} from 'class-validator';
import { 
  AdoptionPreference, 
  ImmigrationReadiness, 
  IntersexOption, 
  MaritalStatus, 
  RelationshipGoal, 
  RelationshipStatus 
} from '../../domain/enums/user.enums';

export class UpdatePersonaDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z]+(?: [A-Za-z]+)*$/, {
    message: 'Display name can only contain letters and single spaces between words.',
  })
  displayName!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\+91[6-9]\d{9}$/, {
    message: 'Phone number must be a valid Indian mobile number prefixed with +91.',
  })
  phoneNumber!: string;

  @IsString()
  @IsOptional()
  @Length(2, 30, { message: 'Pronouns must be between 2 and 30 characters.' })
  @Matches(/^[A-Za-z0-9/,\s-]+$/, {
    message: 'Pronouns contain invalid characters.',
  })
  pronouns?: string;

  @IsString()
  @IsNotEmpty()
  genderIdentity!: string;

  @IsString()
  @IsOptional()
  customLabel?: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['India'], { message: 'Only India is currently supported.' })
  country!: string;

  @IsString()
  @IsNotEmpty()
  state!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(100, { message: 'Height must be at least 100 cm.' })
  @Max(250, { message: 'Height cannot exceed 250 cm.' })
  heightCm!: number;

  @IsArray()
  @ArrayMinSize(1, { message: 'At least one language must be selected.' })
  @IsString({ each: true })
  languages!: string[];

  @IsEnum(IntersexOption)
  @IsOptional()
  intersex?: IntersexOption;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(5)
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