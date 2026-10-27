import {
    AdoptionPreference,
    DietType,
    DisabilityOption,
    DrinkingHabit,
    ImmigrationReadiness,
    IntersexOption,
    MaritalStatus,
    RelationshipGoal,
    RelationshipStatus,
    SmokingHabit
} from "../../domain/enums/user.enums";

export interface UserProfileResponseDto {
    id?: string;
    displayName?: string;
    customLabel?: string;
    bio?: string;
    phoneNumber?: string;
    pronouns?: string;
    genderIdentity?: string;
    sexualOrientation?: string;
    intersex?: IntersexOption;
    outnessLevel?: number;
    city?: string;
    state?: string;
    country?: string;
    heightCm?: number;
    languages?: string[];
    selectedTraits?: string[];
    interests?: string[];
    education?: string[];
    occupation?: string;
    incomeRange?: string[];
    religion?: string;
    disability?: DisabilityOption;
    diet?: DietType;
    smokingHabit?: SmokingHabit;
    drinkingHabit?: DrinkingHabit;
    relationshipGoal?: RelationshipGoal;
    relationshipStatus?: RelationshipStatus;
    maritalStatus?: MaritalStatus;
    immigrationReady?: ImmigrationReadiness;
    openToAdoption?: AdoptionPreference;
    profileCompletion?: number;
    isProfileVisible?: boolean;
}

