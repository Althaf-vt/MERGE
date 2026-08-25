import { DietType, DisabilityOption, DrinkingHabit, IntersexOption, MaritalStatus, RelationshipGoal, RelationshipStatus, SmokingHabit } from "../enums/user.enums";

export interface UserProfileProps{
    id?:string;
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
    immigrationReady?: boolean;
    openToAdoption?: boolean;
    profileCompletion?: number;
    isProfileVisible?: boolean;
}

export interface UpdateBasicInfoPayload{
    displayName?: string;
    phoneNumber?: string;
    bio?: string
}

export interface UpdateLocationPayload{
    city?: string;
    state?: string;
    country?: string;
}

export interface UpdateLifeStylePayload{
    diet?: DietType;
    smoking?: SmokingHabit;
    drinking?: DrinkingHabit;
    disability?: DisabilityOption;
}

export interface UpdateIdentityPayload{
    pronouns?: string;
    gender?: string;
    sexualOrientation?: string;
    intersex?: IntersexOption;
    outnessLevel?: number;
    customLabel?: string;
}

export interface UpdatePersonalInfoPayload{
    height?: number;
    languages?: string[];
    religion?: string;
    education?: string[];
    occupation?: string;
    incomeRange?: string[];
}

export interface UpdateLifeLogisticPayload{
    immigrationReady?: boolean;
    openToAdoption?: boolean;
}

export interface UpdateRelationshipStatusAndGoal{
    relationshipGoal?: RelationshipGoal;
    relationshipStatus?: RelationshipStatus;
    maritalStatus?: MaritalStatus;
}

export interface UpdateInterestsAndPersonalityTriatsPayload{
    interests?: string[];
    selectedTriats?: string[];
}

export class UserProfile{
    private props: UserProfileProps;

    constructor(props: UserProfileProps){
        this.props = {
            ...props,
            languages: props.languages ?? [],
            selectedTraits: props.selectedTraits ?? [],
            interests: props.interests ?? [],
            education: props.education ?? [],
            incomeRange: props.incomeRange ?? [],
            isProfileVisible: props.isProfileVisible ?? true,
            profileCompletion: props.profileCompletion ?? 0
        }
    }

    get displayName(): string | undefined {return this.props.displayName}
    get isProfileVisible(): boolean | undefined {return this.props.isProfileVisible}
    get profileCompletion(): number | undefined {return this.props.profileCompletion}
    get customLabel(): string | undefined {return this.props.customLabel};

    // Encapsulated behavior
    updateBasicInfo(payload: UpdateBasicInfoPayload): void{
        if(payload.displayName !== undefined) this.props.displayName = payload.displayName;
        if(payload.phoneNumber !== undefined) this.props.phoneNumber = payload.phoneNumber;
        if(payload.bio !== undefined) this.props.bio = payload.bio;

        this.recalculateCompletion();
    }

    updateLocation(paylaod: UpdateLocationPayload): void{
        if(paylaod.city !== undefined) this.props.city = paylaod.city;
        if(paylaod.state !== undefined) this.props.state = paylaod.state;
        if(paylaod.country !== undefined) this.props.country = paylaod.country;

        this.recalculateCompletion();
    }

    updateLifeStyle(payload: UpdateLifeStylePayload): void{
        if(payload.diet !== undefined) this.props.diet = payload.diet;
        if(payload.smoking !== undefined) this.props.smokingHabit = payload.smoking;
        if(payload.drinking !== undefined) this.props.drinkingHabit = payload.drinking;
        if(payload.disability !== undefined) this.props.disability = payload.disability;

        this.recalculateCompletion();
    }

    updateIndentity(payload: UpdateIdentityPayload): void{
        if(payload.pronouns !== undefined) this.props.pronouns = payload.pronouns;
        if(payload.gender !== undefined) this.props.genderIdentity = payload.gender;
        if(payload.sexualOrientation !== undefined) this.props.sexualOrientation = payload.sexualOrientation;
        if(payload.intersex !== undefined) this.props.intersex = payload.intersex;
        if(payload.outnessLevel !== undefined) this.props.outnessLevel = payload.outnessLevel;
        if(payload.customLabel !== undefined) this.props.customLabel = payload.customLabel;
        
        this.recalculateCompletion();
    }

    updatePersonalInfo(payload: UpdatePersonalInfoPayload): void{
        if(payload.education !== undefined) this.props.education = payload.education;
        if(payload.height !== undefined) this.props.heightCm = payload.height;
        if(payload.incomeRange !== undefined) this.props.incomeRange = payload.incomeRange;
        if(payload.languages !== undefined) this.props.languages = payload.languages;
        if(payload.occupation !== undefined) this.props.occupation = payload.occupation;
        if(payload.religion !== undefined) this.props.religion = payload.religion;

        this.recalculateCompletion();
    }

    updateLifeLogistics(payload: UpdateLifeLogisticPayload): void{
        if(payload.immigrationReady !== undefined) this.props.immigrationReady = payload.immigrationReady;
        if(payload.openToAdoption !== undefined) this.props.openToAdoption = payload.openToAdoption;

        this.recalculateCompletion();
    }

    updateRelationshipStatusAndGoal(payload: UpdateRelationshipStatusAndGoal): void{
        if(payload.maritalStatus !== undefined) this.props.maritalStatus = payload.maritalStatus;
        if(payload.relationshipGoal !== undefined) this.props.relationshipGoal = payload.relationshipGoal;
        if(payload.relationshipStatus !== undefined) this.props.relationshipStatus = payload.relationshipStatus;

        this.recalculateCompletion();
    }

    updateInterestAndPresonalityTriats(payload: UpdateInterestsAndPersonalityTriatsPayload): void{
        if(payload.interests !== undefined) this.props.interests = payload.interests;
        if(payload.selectedTriats !== undefined) this.props.selectedTraits = payload.selectedTriats;

        this.recalculateCompletion();
    }

    hideProfile(): void{
        this.props.isProfileVisible = false;
    }

    private recalculateCompletion(): void{
        let score = 0;
        if(this.props.displayName) score += 10;
        if(this.props.bio) score += 10;

        this.props.profileCompletion = score;
    }

    toJSON() {
        return {...this.props}
    }
}