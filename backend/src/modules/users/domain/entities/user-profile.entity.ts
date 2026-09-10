import { AdoptionPreference, DietType, DisabilityOption, DrinkingHabit, ImmigrationReadiness, IntersexOption, MaritalStatus, RelationshipGoal, RelationshipStatus, SmokingHabit } from "../enums/user.enums";

export interface UserProfileProps{
    id?:string;
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

export interface UpdatePersonaPayload{
    displayName?: string;
    phoneNumber?: string;
    pronouns?: string;
    genderIdentity?: string;
    customLabel?: string;
    city?: string;
    state?: string;
    country?: string;
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
    immigrationReady?: ImmigrationReadiness;
    openToAdoption?: AdoptionPreference;
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

export const MAX_BIO_GENERATION_ATTEMPTS = 3;

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
            profileCompletion: props.profileCompletion ?? 0,
            bioGenerationAttempts: props.bioGenerationAttempts ?? 0
        }
    }

    get displayName(): string | undefined {return this.props.displayName}
    get isProfileVisible(): boolean | undefined {return this.props.isProfileVisible}
    get profileCompletion(): number | undefined {return this.props.profileCompletion}
    get customLabel(): string | undefined {return this.props.customLabel};
    get bioGenerationAttempts(): number {return this.props.bioGenerationAttempts || 0}
    get genderIdentity(): string | undefined {return this.props.genderIdentity}
    get city(): string | undefined {return this.props.city}
    get relationshipGoal(): string | undefined {return this.props.relationshipGoal}
    get selectedTraits(): string[] | undefined {return this.props.selectedTraits}
    get interests(): string[] | undefined {return this.props.interests}
    get remainingBioAttempts(): number{
        const used = this.props.bioGenerationAttempts || 0;
        return Math.max(0, MAX_BIO_GENERATION_ATTEMPTS - used);
    }
    // Encapsulated behavior

        // for updating persona details from screen 1
    updatePersona(payload: UpdatePersonaPayload): void {
        if(payload.displayName !== undefined) this.props.displayName = payload.displayName;
        if(payload.phoneNumber !== undefined) this.props.phoneNumber = payload.phoneNumber;
        if(payload.pronouns !== undefined) this.props.pronouns = payload.pronouns;
        if(payload.genderIdentity !== undefined) this.props.genderIdentity = payload.genderIdentity;
        if(payload.customLabel !== undefined) this.props.customLabel = payload.customLabel;
        if(payload.city !== undefined) this.props.city = payload.city;
        if(payload.state !== undefined) this.props.state = payload.state;
        if(payload.country !== undefined) this.props.country = payload.country;
        if(payload.heightCm !== undefined) this.props.heightCm = payload.heightCm;
        if(payload.languages !== undefined) this.props.languages = payload.languages;
        if(payload.intersex !== undefined) this.props.intersex = payload.intersex;
        if(payload.outnessLevel !== undefined) this.props.outnessLevel = payload.outnessLevel;
        if(payload.relationshipStatus !== undefined) this.props.relationshipStatus = payload.relationshipStatus;
        if(payload.relationshipGoal !== undefined) this.props.relationshipGoal = payload.relationshipGoal;
        if(payload.maritalStatus !== undefined) this.props.maritalStatus = payload.maritalStatus;
        if(payload.openToAdoption !== undefined) this.props.openToAdoption = payload.openToAdoption;
        if(payload.immigrationReady !== undefined) this.props.immigrationReady = payload.immigrationReady;

        this.recalculateCompletion();
    }
        // for updating lifestyle & background from screen 2
    updateLifestyle(payload: UpdateLifestylePayload): void {
        if (payload.education !== undefined) this.props.education = payload.education;
        if (payload.occupation !== undefined) this.props.occupation = payload.occupation;
        if (payload.incomeRange !== undefined) this.props.incomeRange = payload.incomeRange;
        if (payload.religion !== undefined) this.props.religion = payload.religion;
        if (payload.disability !== undefined) this.props.disability = payload.disability;
        if (payload.diet !== undefined) this.props.diet = payload.diet;
        if (payload.smokingHabit !== undefined) this.props.smokingHabit = payload.smokingHabit;
        if (payload.drinkingHabit !== undefined) this.props.drinkingHabit = payload.drinkingHabit;
        if (payload.relationshipStatus !== undefined) this.props.relationshipStatus = payload.relationshipStatus;
        if (payload.maritalStatus !== undefined) this.props.maritalStatus = payload.maritalStatus;

        this.recalculateCompletion();
    }

    incrementBioAttemps(): void{
        this.props.bioGenerationAttempts = (this.props.bioGenerationAttempts || 0) + 1;
    }

    updateBio(bio: string, selectedTraits: string[], interests: string[]): void{
        this.props.bio = bio;
        this.props.selectedTraits = selectedTraits;
        this.props.interests = interests;
        this.recalculateCompletion();
    }

    canGenerateBio(): boolean {
        return (this.props.bioGenerationAttempts || 0) < MAX_BIO_GENERATION_ATTEMPTS;
    }

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

    // updateLifeStyle(payload: UpdateLifeStylePayload): void{
    //     if(payload.diet !== undefined) this.props.diet = payload.diet;
    //     if(payload.smoking !== undefined) this.props.smokingHabit = payload.smoking;
    //     if(payload.drinking !== undefined) this.props.drinkingHabit = payload.drinking;
    //     if(payload.disability !== undefined) this.props.disability = payload.disability;

    //     this.recalculateCompletion();
    // }

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