import { HealthConditionPreference, RelationshipGoal } from "../enums/user.enums";

export interface UserPreferenceProps {
    id?: string;
    userId?: string;
    preferredGender?: string[];
    preferredAgeMin?: number;
    prefferedAgeMax?: number;
    relationShipGoals?: RelationshipGoal;
    minimumOutnessLevel?: number;
    openToAdoption?: boolean;
    immigrationReady?: boolean; 
    partnerExpectations?: string;

    // Health compatibility preferences
    diabeteBpPreference?: HealthConditionPreference;
    fertilityPreference?: HealthConditionPreference;
    geneticPreference?: HealthConditionPreference;
    infectiousPreference?: HealthConditionPreference;
    disablilityPreferece?: HealthConditionPreference;

    createdAt?: Date;
    updatedAt?: Date;
}

export interface UpdatePreferencesPayload {
    preferredGender?: string[];
    preferredAgeMin?: number;
    preferredAgeMax?: number;
    relationShipGoals?: RelationshipGoal;
    minimumOutnessLevel?: number;
    openToAdoption?: boolean;
    immigrationReady?: boolean;
    partnerExpectations?: string;

    diabeteBpPreference?: HealthConditionPreference;
    fertilityPreference?: HealthConditionPreference;
    geneticPreference?: HealthConditionPreference;
    infectiousPreference?: HealthConditionPreference;
    disablilityPreferece?: HealthConditionPreference;
}

export interface UserPreferenceSnapshot {
    id?: string;
    userId?: string;
    preferredGender?: string[];
    preferredAgeMin?: number;
    prefferedAgeMax?: number;
    relationShipGoals?: RelationshipGoal;
    minimumOutnessLevel?: number;
    openToAdoption?: boolean;
    immigrationReady?: boolean; 
    partnerExpectations?: string;
    diabeteBpPreference?: HealthConditionPreference;
    fertilityPreference?: HealthConditionPreference;
    geneticPreference?: HealthConditionPreference;
    infectiousPreference?: HealthConditionPreference;
    disablilityPreferece?: HealthConditionPreference;
    createdAt?: Date;
    updatedAt?: Date;
    [key: string]: unknown;
}
