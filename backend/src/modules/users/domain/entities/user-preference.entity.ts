import { HealthConditionPreference, RelationshipGoal } from "../enums/user.enums";

export interface UserPreferenceProps{
    id?:string;
    userId?: string;
    preferredGender?: string[];
    preferredAgeMin?: number;
    prefferedAgeMax?: number;
    relationShipGoals?: RelationshipGoal;
    minimumOutnessLevel?: number;
    openToAdoption?: boolean;
    immigrationReady?: boolean; 
    partnerExpectations?: string;

    // Health preference
    // diabeteBpPreference?: HealthConditionPreference;
    // fertilityPreference?: HealthConditionPreference;
    // geneticPreference?: HealthConditionPreference;
    // infectiousPreference?: HealthConditionPreference;
    // disablilityPreferece?: HealthConditionPreference;

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
}

export interface UpdateAgePreferencePayload{
    minAge?: number;
    maxAge?: number;
}

export interface UpdateHealthPreferencePayload{
    diabeteBpPreference?: HealthConditionPreference;
    fertilityPreference?: HealthConditionPreference;
    geneticPreference?: HealthConditionPreference;
    infectiousPreference?: HealthConditionPreference;
    disablilityPreferece?: HealthConditionPreference;
}

export interface UpdateLifeLogisticsPayload{
    openToAdoption?: boolean;
    immigrationReady?: boolean;
}

export interface UpdateMatchCritiera{
    preferredGender?: string[];
    minimumOutnessLevel?: number;
    relationshipGoals?: RelationshipGoal
}

export interface UpdatePartnerExpectationPayload{
    partnerExpectations: string;
}

export class UserPreference{
    private _props: UserPreferenceProps;

    constructor(props: UserPreferenceProps){
        this._props = {
            ...props,
            // diabeteBpPreference: props.diabeteBpPreference ?? HealthConditionPreference.NO_PREFERENCE,
            // fertilityPreference: props.fertilityPreference ?? HealthConditionPreference.NO_PREFERENCE,
            // geneticPreference: props.geneticPreference ?? HealthConditionPreference.NO_PREFERENCE,
            // disablilityPreferece: props.disablilityPreferece ?? HealthConditionPreference.NO_PREFERENCE,
            preferredGender: props.preferredGender ?? [],
        }
    }

    get id(): string | undefined {return this._props.id}
    get userId(): string | undefined {return this._props.userId}
    get createdAt(): Date | undefined {return this._props.createdAt};
    get updatedAt(): Date | undefined {return this._props.updatedAt};

    get preferredGender(): string[] | undefined {return this._props.preferredGender};
    get preferredAgeMin(): number | undefined {return this._props.preferredAgeMin};
    get preferredAgeMax(): number | undefined {return this._props.prefferedAgeMax};
    get relationshipGoals(): RelationshipGoal | undefined {return this._props.relationShipGoals};
    get minimumOutnessLevel(): number | undefined {return this._props.minimumOutnessLevel};
    get openToAdoption(): boolean | undefined {return this._props.openToAdoption};
    get immigrationReady(): boolean | undefined {return this._props.immigrationReady};
    get partnerExpectations(): string | undefined {return this._props.partnerExpectations};

    // Health
    // get diabetesBpPreference(): HealthConditionPreference | undefined { return this._props.diabeteBpPreference; }
    // get fertilityPreference(): HealthConditionPreference | undefined { return this._props.fertilityPreference; }
    // get geneticPreference(): HealthConditionPreference | undefined { return this._props.geneticPreference; }
    // get infectiousPreference(): HealthConditionPreference | undefined { return this._props.infectiousPreference; }
    // get disabilityPreference(): HealthConditionPreference | undefined { return this._props.disablilityPreferece; }
    
    updatePreferences(payload: UpdatePreferencesPayload): void {
    if (payload.preferredGender !== undefined) this._props.preferredGender = payload.preferredGender;
    if (payload.preferredAgeMin !== undefined) this._props.preferredAgeMin = payload.preferredAgeMin;
    if (payload.preferredAgeMax !== undefined) this._props.prefferedAgeMax = payload.preferredAgeMax;
    if (payload.relationShipGoals !== undefined) this._props.relationShipGoals = payload.relationShipGoals;
    if (payload.minimumOutnessLevel !== undefined) this._props.minimumOutnessLevel = payload.minimumOutnessLevel;
    if (payload.openToAdoption !== undefined) this._props.openToAdoption = payload.openToAdoption;
    if (payload.immigrationReady !== undefined) this._props.immigrationReady = payload.immigrationReady;
    if (payload.partnerExpectations !== undefined) this._props.partnerExpectations = payload.partnerExpectations;
    this._props.updatedAt = new Date();
}
    
    updateAgePreference(payload: UpdateAgePreferencePayload): void{
        if(payload.maxAge !== undefined) this._props.prefferedAgeMax = payload.maxAge;
        if(payload.minAge !== undefined) this._props.preferredAgeMin = payload.minAge;
    }

    // updateHealthPreference(payload: UpdateHealthPreferencePayload): void{
    //     if(payload.diabeteBpPreference !== undefined) {this._props.diabeteBpPreference = payload.diabeteBpPreference};
    //     if(payload.fertilityPreference !== undefined) {this._props.fertilityPreference = payload.fertilityPreference};
    //     if(payload.geneticPreference !== undefined) {this._props.geneticPreference = payload.geneticPreference};
    //     if(payload.infectiousPreference !== undefined) {this._props.infectiousPreference = payload.infectiousPreference};
    //     if(payload.disablilityPreferece !== undefined) {this._props.disablilityPreferece = payload.disablilityPreferece};
    // }

    updateLifeLogistics(payload: UpdateLifeLogisticsPayload): void{
        if(payload.immigrationReady !== undefined) {this._props.immigrationReady = payload.immigrationReady};
        if(payload.openToAdoption !== undefined) {this._props.openToAdoption = payload.openToAdoption};
    }

    updateMatchCriteria(payload: UpdateMatchCritiera): void{
        if(payload.minimumOutnessLevel !== undefined) {this._props.minimumOutnessLevel = payload.minimumOutnessLevel};
        if(payload.preferredGender !== undefined) {this._props.preferredGender = payload.preferredGender};
        if(payload.relationshipGoals !== undefined) {this._props.relationShipGoals = payload.relationshipGoals}; 
    }

    updatePartnerExpectations(payload: UpdatePartnerExpectationPayload){
        if(payload.partnerExpectations !== undefined) {this._props.partnerExpectations = payload.partnerExpectations} 
    }

    toJSON(){
        return{...this._props}
    }
}