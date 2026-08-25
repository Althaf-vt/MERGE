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
    private props: UserPreferenceProps;

    constructor(props: UserPreferenceProps){
        this.props = {
            ...props,
            // diabeteBpPreference: props.diabeteBpPreference ?? HealthConditionPreference.NO_PREFERENCE,
            // fertilityPreference: props.fertilityPreference ?? HealthConditionPreference.NO_PREFERENCE,
            // geneticPreference: props.geneticPreference ?? HealthConditionPreference.NO_PREFERENCE,
            // disablilityPreferece: props.disablilityPreferece ?? HealthConditionPreference.NO_PREFERENCE,
            preferredGender: props.preferredGender ?? [],
        }
    }

    get id(): string | undefined {return this.props.id}
    get userId(): string | undefined {return this.props.userId}
    get createdAt(): Date | undefined {return this.props.createdAt};
    get updatedAt(): Date | undefined {return this.props.updatedAt};

    get preferredGender(): string[] | undefined {return this.props.preferredGender};
    get preferredAgeMin(): number | undefined {return this.props.preferredAgeMin};
    get preferredAgeMax(): number | undefined {return this.props.prefferedAgeMax};
    get relationshipGoals(): RelationshipGoal | undefined {return this.props.relationShipGoals};
    get minimumOutnessLevel(): number | undefined {return this.props.minimumOutnessLevel};
    get openToAdoption(): boolean | undefined {return this.props.openToAdoption};
    get immigrationReady(): boolean | undefined {return this.props.immigrationReady};
    get partnerExpectations(): string | undefined {return this.props.partnerExpectations};

    // Health
    // get diabetesBpPreference(): HealthConditionPreference | undefined { return this.props.diabeteBpPreference; }
    // get fertilityPreference(): HealthConditionPreference | undefined { return this.props.fertilityPreference; }
    // get geneticPreference(): HealthConditionPreference | undefined { return this.props.geneticPreference; }
    // get infectiousPreference(): HealthConditionPreference | undefined { return this.props.infectiousPreference; }
    // get disabilityPreference(): HealthConditionPreference | undefined { return this.props.disablilityPreferece; }
    
    updateAgePreference(payload: UpdateAgePreferencePayload): void{
        if(payload.maxAge !== undefined) this.props.prefferedAgeMax = payload.maxAge;
        if(payload.minAge !== undefined) this.props.preferredAgeMin = payload.minAge;
    }

    // updateHealthPreference(payload: UpdateHealthPreferencePayload): void{
    //     if(payload.diabeteBpPreference !== undefined) {this.props.diabeteBpPreference = payload.diabeteBpPreference};
    //     if(payload.fertilityPreference !== undefined) {this.props.fertilityPreference = payload.fertilityPreference};
    //     if(payload.geneticPreference !== undefined) {this.props.geneticPreference = payload.geneticPreference};
    //     if(payload.infectiousPreference !== undefined) {this.props.infectiousPreference = payload.infectiousPreference};
    //     if(payload.disablilityPreferece !== undefined) {this.props.disablilityPreferece = payload.disablilityPreferece};
    // }

    updateLifeLogistics(payload: UpdateLifeLogisticsPayload): void{
        if(payload.immigrationReady !== undefined) {this.props.immigrationReady = payload.immigrationReady};
        if(payload.openToAdoption !== undefined) {this.props.openToAdoption = payload.openToAdoption};
    }

    updateMatchCriteria(payload: UpdateMatchCritiera): void{
        if(payload.minimumOutnessLevel !== undefined) {this.props.minimumOutnessLevel = payload.minimumOutnessLevel};
        if(payload.preferredGender !== undefined) {this.props.preferredGender = payload.preferredGender};
        if(payload.relationshipGoals !== undefined) {this.props.relationShipGoals = payload.relationshipGoals}; 
    }

    updatePartnerExpectations(payload: UpdatePartnerExpectationPayload){
        if(payload.partnerExpectations !== undefined) {this.props.partnerExpectations = payload.partnerExpectations} 
    }

    toJSON(){
        return{...this.props}
    }
}