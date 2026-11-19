import { HealthConditionPreference, RelationshipGoal } from "../enums/user.enums";
import {
    UpdatePreferencesPayload,
    UserPreferenceProps,
    UserPreferenceSnapshot,
} from "../interfaces/user-preference.types";

export class UserPreference {
    private _props: UserPreferenceProps;

    constructor(props: UserPreferenceProps) {
        this._props = {
            ...props,
            preferredGender: props.preferredGender ?? [],
            preferredAgeMax: props.preferredAgeMax ?? props.prefferedAgeMax,
            relationshipGoals: props.relationshipGoals ?? props.relationShipGoals,
            diabetesBpPreference: props.diabetesBpPreference ?? props.diabeteBpPreference ?? HealthConditionPreference.NO_PREFERENCE,
            fertilityPreference: props.fertilityPreference ?? HealthConditionPreference.NO_PREFERENCE,
            geneticPreference: props.geneticPreference ?? HealthConditionPreference.NO_PREFERENCE,
            infectiousPreference: props.infectiousPreference ?? HealthConditionPreference.NO_PREFERENCE,
            disabilityPreference: props.disabilityPreference ?? props.disablilityPreferece ?? HealthConditionPreference.NO_PREFERENCE,
        };
    }

    get id(): string | undefined { return this._props.id; }
    get userId(): string | undefined { return this._props.userId; }
    get createdAt(): Date | undefined { return this._props.createdAt; }
    get updatedAt(): Date | undefined { return this._props.updatedAt; }

    get preferredGender(): string[] { return [...(this._props.preferredGender || [])]; }
    get preferredAgeMin(): number | undefined { return this._props.preferredAgeMin; }
    get preferredAgeMax(): number | undefined { return this._props.preferredAgeMax; }
    get relationshipGoals(): RelationshipGoal | undefined { return this._props.relationshipGoals; }
    get minimumOutnessLevel(): number | undefined { return this._props.minimumOutnessLevel; }
    get openToAdoption(): boolean | undefined { return this._props.openToAdoption; }
    get immigrationReady(): boolean | undefined { return this._props.immigrationReady; }
    get partnerExpectations(): string | undefined { return this._props.partnerExpectations; }

    get diabetesBpPreference(): HealthConditionPreference | undefined { return this._props.diabetesBpPreference; }
    get fertilityPreference(): HealthConditionPreference | undefined { return this._props.fertilityPreference; }
    get geneticPreference(): HealthConditionPreference | undefined { return this._props.geneticPreference; }
    get infectiousPreference(): HealthConditionPreference | undefined { return this._props.infectiousPreference; }
    get disabilityPreference(): HealthConditionPreference | undefined { return this._props.disabilityPreference; }

    // Backward compatibility aliases
    get prefferedAgeMax(): number | undefined { return this.preferredAgeMax; }
    get relationShipGoals(): RelationshipGoal | undefined { return this.relationshipGoals; }
    get diabeteBpPreference(): HealthConditionPreference | undefined { return this.diabetesBpPreference; }
    get disablilityPreferece(): HealthConditionPreference | undefined { return this.disabilityPreference; }

    updatePreferences(payload: UpdatePreferencesPayload): void {
        if (payload.preferredGender !== undefined) this._props.preferredGender = payload.preferredGender;
        if (payload.preferredAgeMin !== undefined) this._props.preferredAgeMin = payload.preferredAgeMin;
        if (payload.preferredAgeMax !== undefined) this._props.preferredAgeMax = payload.preferredAgeMax;
        else if (payload.prefferedAgeMax !== undefined) this._props.preferredAgeMax = payload.prefferedAgeMax;

        if (payload.relationshipGoals !== undefined) this._props.relationshipGoals = payload.relationshipGoals;
        else if (payload.relationShipGoals !== undefined) this._props.relationshipGoals = payload.relationShipGoals;

        if (payload.minimumOutnessLevel !== undefined) this._props.minimumOutnessLevel = payload.minimumOutnessLevel;
        if (payload.openToAdoption !== undefined) this._props.openToAdoption = payload.openToAdoption;
        if (payload.immigrationReady !== undefined) this._props.immigrationReady = payload.immigrationReady;
        if (payload.partnerExpectations !== undefined) this._props.partnerExpectations = payload.partnerExpectations;

        if (payload.diabetesBpPreference !== undefined) this._props.diabetesBpPreference = payload.diabetesBpPreference;
        else if (payload.diabeteBpPreference !== undefined) this._props.diabetesBpPreference = payload.diabeteBpPreference;

        if (payload.fertilityPreference !== undefined) this._props.fertilityPreference = payload.fertilityPreference;
        if (payload.geneticPreference !== undefined) this._props.geneticPreference = payload.geneticPreference;
        if (payload.infectiousPreference !== undefined) this._props.infectiousPreference = payload.infectiousPreference;

        if (payload.disabilityPreference !== undefined) this._props.disabilityPreference = payload.disabilityPreference;
        else if (payload.disablilityPreferece !== undefined) this._props.disabilityPreference = payload.disablilityPreferece;

        this._props.updatedAt = new Date();
    }

    toJSON(): UserPreferenceSnapshot {
        return {
            ...this._props,
            prefferedAgeMax: this._props.preferredAgeMax,
            relationShipGoals: this._props.relationshipGoals,
            diabeteBpPreference: this._props.diabetesBpPreference,
            disablilityPreferece: this._props.disabilityPreference,
        };
    }
}