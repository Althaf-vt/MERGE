import { ArrayMaxSize, IsArray, IsIn, IsNumber, IsOptional, IsString, Length, Matches, Max, Min, ValidateIf } from 'class-validator';
import { 
    AdoptionPreference, DietType, DisabilityOption, DrinkingHabit, 
    ImmigrationReadiness, IntersexOption, MaritalStatus, 
    RelationshipGoal, RelationshipStatus, SmokingHabit 
} from '../../domain/enums/user.enums';

const AlphaNumericRegex = /(?=.*[a-zA-Z0-9])/;

export class UpdateFullProfileDto {
    @IsOptional() 
    @IsString() 
    @Length(2, 50, { message: 'Display name must be between 2 and 50 characters.' })
    @Matches(/^[A-Za-z]+(?: [A-Za-z]+)*$/, { message: 'Display name can only contain letters and single spaces.' })
    displayName?: string;

    // FIX: Bypasses strict validation if the user explicitly clears the field (empty string)
    @ValidateIf((o) => o.customLabel !== undefined && o.customLabel !== null && o.customLabel !== '')
    @IsString() 
    @Length(1, 40, { message: 'Custom label cannot exceed 40 characters.' })
    @Matches(AlphaNumericRegex, { message: 'Custom label must contain alphanumeric characters.' })
    customLabel?: string;

    @ValidateIf((o) => o.bio !== undefined && o.bio !== null && o.bio !== '')
    @IsString() 
    @Length(1, 1000, { message: 'Bio cannot exceed 1000 characters.' })
    @Matches(AlphaNumericRegex, { message: 'Bio must contain alphanumeric characters.' })
    bio?: string;

    @ValidateIf((o) => o.pronouns !== undefined && o.pronouns !== null && o.pronouns !== '')
    @IsString() 
    @Length(2, 30, { message: 'Pronouns must be between 2 and 30 characters.' })
    pronouns?: string;

    @ValidateIf((o) => o.genderIdentity !== undefined && o.genderIdentity !== null && o.genderIdentity !== '')
    @IsString() 
    @Length(2, 50, { message: 'Gender identity must be between 2 and 50 characters.' })
    genderIdentity?: string;

    @ValidateIf((o) => o.sexualOrientation !== undefined && o.sexualOrientation !== null && o.sexualOrientation !== '')
    @IsString() 
    @Length(2, 50, { message: 'Sexual orientation must be between 2 and 50 characters.' })
    sexualOrientation?: string;

    @IsOptional() @IsIn(Object.values(IntersexOption)) intersex?: IntersexOption;

    @IsOptional() 
    @IsNumber() 
    @Min(100, { message: 'Height must be at least 100 cm.' }) 
    @Max(250, { message: 'Height cannot exceed 250 cm.' }) 
    heightCm?: number;

    @IsOptional() 
    @IsArray() 
    @ArrayMaxSize(10, { message: 'You can select up to 10 languages.' })
    @IsString({ each: true }) 
    languages?: string[];

    @ValidateIf((o) => o.religion !== undefined && o.religion !== null && o.religion !== '')
    @IsString() 
    @Length(2, 50)
    religion?: string;

    @IsOptional() 
    @IsArray() 
    @ArrayMaxSize(5, { message: 'You can select up to 5 educational qualifications.' })
    @IsString({ each: true }) 
    education?: string[];

    @ValidateIf((o) => o.occupation !== undefined && o.occupation !== null && o.occupation !== '')
    @IsString() 
    @Length(2, 50, { message: 'Occupation must be between 2 and 50 characters.' })
    occupation?: string;

    @IsOptional() 
    @IsArray() 
    @ArrayMaxSize(5)
    @IsString({ each: true }) 
    incomeRange?: string[];

    @IsOptional() @IsIn(Object.values(DietType)) diet?: DietType;
    @IsOptional() @IsIn(Object.values(SmokingHabit)) smokingHabit?: SmokingHabit;
    @IsOptional() @IsIn(Object.values(DrinkingHabit)) drinkingHabit?: DrinkingHabit;
    @IsOptional() @IsIn(Object.values(DisabilityOption)) disability?: DisabilityOption;
    @IsOptional() @IsIn(Object.values(RelationshipGoal)) relationshipGoal?: RelationshipGoal;
    @IsOptional() @IsIn(Object.values(RelationshipStatus)) relationshipStatus?: RelationshipStatus;
    @IsOptional() @IsIn(Object.values(MaritalStatus)) maritalStatus?: MaritalStatus;
    @IsOptional() @IsIn(Object.values(AdoptionPreference)) openToAdoption?: AdoptionPreference;
    @IsOptional() @IsIn(Object.values(ImmigrationReadiness)) immigrationReady?: ImmigrationReadiness;

    @IsOptional() 
    @IsArray() 
    @ArrayMaxSize(15, { message: 'You can select up to 15 personality traits.' })
    @IsString({ each: true }) 
    selectedTraits?: string[];

    @IsOptional() 
    @IsArray() 
    @ArrayMaxSize(15, { message: 'You can select up to 15 interests.' })
    @IsString({ each: true }) 
    interests?: string[];
}