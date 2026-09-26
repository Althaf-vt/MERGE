import { IsArray, IsIn, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { 
    AdoptionPreference, DietType, DisabilityOption, DrinkingHabit, 
    ImmigrationReadiness, IntersexOption, MaritalStatus, 
    RelationshipGoal, RelationshipStatus, SmokingHabit 
} from '../../domain/enums/user.enums';

export class UpdateFullProfileDto {
    @IsOptional() 
    @IsString() 
    displayName?: string;

    @IsOptional() 
    @IsString() 
    customLabel?: string;

    @IsOptional() 
    @IsString() 
    bio?: string;

    @IsOptional() 
    @IsString() 
    pronouns?: string;

    @IsOptional() 
    @IsString() 
    genderIdentity?: string;

    @IsOptional()
    @IsString()
    sexualOrientation?: string;

    @IsOptional() 
    @IsIn(Object.values(IntersexOption)) 
    intersex?: IntersexOption;

    @IsOptional() 
    @IsNumber() 
    @Min(100) 
    @Max(250) 
    heightCm?: number;

    @IsOptional() 
    @IsArray() 
    @IsString({ each: true }) 
    languages?: string[];

    @IsOptional() 
    @IsString() 
    religion?: string;

    @IsOptional() 
    @IsArray() 
    @IsString({ each: true }) 
    education?: string[];

    @IsOptional() 
    @IsString() 
    occupation?: string;

    @IsOptional() 
    @IsArray() 
    @IsString({ each: true }) 
    incomeRange?: string[];

    @IsOptional() 
    @IsIn(Object.values(DietType)) 
    diet?: DietType;

    @IsOptional() 
    @IsIn(Object.values(SmokingHabit)) 
    smokingHabit?: SmokingHabit;

    @IsOptional() 
    @IsIn(Object.values(DrinkingHabit)) 
    drinkingHabit?: DrinkingHabit;

    @IsOptional() 
    @IsIn(Object.values(DisabilityOption)) 
    disability?: DisabilityOption;

    @IsOptional() 
    @IsIn(Object.values(RelationshipGoal)) 
    relationshipGoal?: RelationshipGoal;

    @IsOptional() 
    @IsIn(Object.values(RelationshipStatus)) 
    relationshipStatus?: RelationshipStatus;

    @IsOptional() 
    @IsIn(Object.values(MaritalStatus)) 
    maritalStatus?: MaritalStatus;

    @IsOptional() 
    @IsIn(Object.values(AdoptionPreference)) 
    openToAdoption?: AdoptionPreference;

    @IsOptional() 
    @IsIn(Object.values(ImmigrationReadiness)) 
    immigrationReady?: ImmigrationReadiness;

    @IsOptional() 
    @IsArray() 
    @IsString({ each: true }) 
    selectedTraits?: string[];

    @IsOptional() 
    @IsArray() 
    @IsString({ each: true }) 
    interests?: string[];
}