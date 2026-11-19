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
    SmokingHabit,
} from "../enums/user.enums";
import { LocationVO } from "../value-objects/location.vo";

export const MAX_BIO_GENERATION_ATTEMPTS = 3;

export interface UserProfileProps {
    id?: string;
    displayName?: string;
    customLabel?: string;
    bio?: string;
    bioGenerationAttempts?: number;
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

export interface UpdateFullProfilePayload {
    displayName?: string;
    customLabel?: string;
    bio?: string;
    phoneNumber?: string;
    pronouns?: string;
    genderIdentity?: string;
    sexualOrientation?: string;
    intersex?: IntersexOption;
    heightCm?: number;
    languages?: string[];
    religion?: string;
    education?: string[];
    occupation?: string;
    incomeRange?: string[];
    diet?: DietType;
    smokingHabit?: SmokingHabit;
    drinkingHabit?: DrinkingHabit;
    disability?: DisabilityOption;
    relationshipGoal?: RelationshipGoal;
    relationshipStatus?: RelationshipStatus;
    maritalStatus?: MaritalStatus;
    openToAdoption?: AdoptionPreference;
    immigrationReady?: ImmigrationReadiness;
    selectedTraits?: string[];
    interests?: string[];
}

export interface UpdatePersonaPayload {
    displayName?: string;
    phoneNumber?: string;
    pronouns?: string;
    genderIdentity?: string;
    customLabel?: string;
    location?: LocationVO;
    heightCm?: number;
    languages?: string[];
    intersex?: IntersexOption;
    outnessLevel?: number;
    relationshipStatus?: RelationshipStatus;
    relationshipGoal?: RelationshipGoal;
    maritalStatus?: MaritalStatus;
    openToAdoption?: AdoptionPreference;
    immigrationReady?: ImmigrationReadiness;
}

export interface UpdateLifestylePayload {
    education?: string[];
    occupation?: string;
    incomeRange?: string[];
    religion?: string;
    disability?: DisabilityOption;
    diet?: DietType;
    smokingHabit?: SmokingHabit;
    drinkingHabit?: DrinkingHabit;
    relationshipStatus?: RelationshipStatus;
    maritalStatus?: MaritalStatus;
}

export interface UpdateBasicInfoPayload {
    displayName?: string;
    phoneNumber?: string;
    bio?: string;
}

export interface UpdateLocationPayload {
    city?: string;
    state?: string;
    country?: string;
}

export interface UpdateIdentityPayload {
    pronouns?: string;
    gender?: string;
    sexualOrientation?: string;
    intersex?: IntersexOption;
    outnessLevel?: number;
    customLabel?: string;
}

export interface UpdatePersonalInfoPayload {
    height?: number;
    languages?: string[];
    religion?: string;
    education?: string[];
    occupation?: string;
    incomeRange?: string[];
}

export interface UpdateLifeLogisticPayload {
    immigrationReady?: ImmigrationReadiness;
    openToAdoption?: AdoptionPreference;
}

export interface UpdateRelationshipStatusAndGoal {
    relationshipGoal?: RelationshipGoal;
    relationshipStatus?: RelationshipStatus;
    maritalStatus?: MaritalStatus;
}

export interface UpdateInterestsAndPersonalityTraitsPayload {
    interests?: string[];
    selectedTraits?: string[];
    selectedTriats?: string[];
}

export type UpdateInterestsAndPersonalityTriatsPayload = UpdateInterestsAndPersonalityTraitsPayload;

export interface UserProfileSnapshot {
    id?: string;
    displayName?: string;
    customLabel?: string;
    bio?: string;
    bioGenerationAttempts?: number;
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
    [key: string]: unknown;
}
