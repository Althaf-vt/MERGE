import { IsString, IsNotEmpty, IsEnum, IsArray } from 'class-validator';
import { 
    DietType, 
    DisabilityOption, 
    DrinkingHabit, 
    MaritalStatus, 
    RelationshipStatus, 
    SmokingHabit 
} from '../../domain/enums/user.enums';

export class UpdateLifestyleDto {
    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty()
    education!: string[];

    @IsString()
    @IsNotEmpty()
    occupation!: string;

    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty()
    incomeRange!: string[];

    @IsString()
    @IsNotEmpty()
    religion!: string;

    @IsEnum(DisabilityOption)
    @IsNotEmpty()
    disability!: DisabilityOption;

    @IsEnum(DietType)
    @IsNotEmpty()
    diet!: DietType;

    @IsEnum(SmokingHabit)
    @IsNotEmpty()
    smokingHabit!: SmokingHabit;

    @IsEnum(DrinkingHabit)
    @IsNotEmpty()
    drinkingHabit!: DrinkingHabit;

    @IsEnum(RelationshipStatus)
    @IsNotEmpty()
    relationshipStatus!: RelationshipStatus;

    @IsEnum(MaritalStatus)
    @IsNotEmpty()
    maritalStatus!: MaritalStatus;
}