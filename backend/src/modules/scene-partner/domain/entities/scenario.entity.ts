import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { SCENE_PARTNER_ERROR_MESSAGES, SCENE_PARTNER_POLICY, SCENE_PARTNER_SAFETY } from "../constants/scene-partner.constants";
import { ScenarioCategory } from "../enums/scene-partner.enums";

export interface ScenarioProps {
    id: string;
    title: string;
    description: string;
    category: ScenarioCategory;
    promptContext: string;
    isCustom: boolean;
    creatorUserId?: string | null;
    createdAt?: Date;
}

export interface ScenarioData {
    id: string;
    title: string;
    description: string;
    category: ScenarioCategory;
    promptContext: string;
    isCustom: boolean;
    creatorUserId: string | null;
    createdAt: Date;
}

export class Scenario {
    private readonly _props: ScenarioData;

    constructor(props: ScenarioProps) {
        this._validateInvariants(props);

        this._props = {
            id: props.id.trim(),
            title: props.title.trim(),
            description: props.description.trim(),
            category: props.category,
            promptContext: props.promptContext.trim(),
            isCustom: props.isCustom,
            creatorUserId: props.creatorUserId?.trim() ?? null,
            createdAt: props.createdAt ?? new Date(),
        };
    }

    public static createPredefined(params: {
        id: string;
        title: string;
        description: string;
        category: ScenarioCategory;
        promptContext: string;
    }): Scenario {
        return new Scenario({
            ...params,
            isCustom: false,
            creatorUserId: null,
        });
    }

    public static createCustom(params: {
        id: string;
        title: string;
        description: string;
        promptContext: string;
        creatorUserId: string;
    }): Scenario {
        return new Scenario({
            ...params,
            category: ScenarioCategory.CUSTOM,
            isCustom: true,
        });
    }

    private _validateInvariants(props: ScenarioProps): void {
        if (!props.id || props.id.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Scenario ID is required.');
        }

        const trimmedTitle = props.title?.trim() ?? '';
        if (
            trimmedTitle.length < SCENE_PARTNER_POLICY.MIN_SCENARIO_TITLE_LENGTH ||
            trimmedTitle.length > SCENE_PARTNER_POLICY.MAX_SCENARIO_TITLE_LENGTH
        ) {
            throw new DomainException(
                ErrorCode.VALIDATION_FAILED,
                `Scenario title must be between ${SCENE_PARTNER_POLICY.MIN_SCENARIO_TITLE_LENGTH} and ${SCENE_PARTNER_POLICY.MAX_SCENARIO_TITLE_LENGTH} characters.`
            );
        }

        const trimmedPrompt = props.promptContext?.trim() ?? '';
        if (
            trimmedPrompt.length < SCENE_PARTNER_POLICY.MIN_SCENARIO_PROMPT_LENGTH ||
            trimmedPrompt.length > SCENE_PARTNER_POLICY.MAX_SCENARIO_PROMPT_LENGTH
        ) {
            throw new DomainException(
                ErrorCode.VALIDATION_FAILED,
                `Scenario prompt context must be between ${SCENE_PARTNER_POLICY.MIN_SCENARIO_PROMPT_LENGTH} and ${SCENE_PARTNER_POLICY.MAX_SCENARIO_PROMPT_LENGTH} characters.`
            );
        }

        if (props.isCustom && (!props.creatorUserId || props.creatorUserId.trim().length === 0)) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Custom scenario requires a creator user ID.');
        }

        // Layer 1 Content Safety Guardrail: Prevent abusive, obscene, or explicitly sexual custom scenarios
        if (
            SCENE_PARTNER_SAFETY.PROHIBITED_CONTENT_REGEX.test(trimmedTitle) ||
            SCENE_PARTNER_SAFETY.PROHIBITED_CONTENT_REGEX.test(trimmedPrompt)
        ) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, SCENE_PARTNER_ERROR_MESSAGES.INAPPROPRIATE_CONTENT);
        }
    }

    get id(): string { return this._props.id; }
    get title(): string { return this._props.title; }
    get description(): string { return this._props.description; }
    get category(): ScenarioCategory { return this._props.category; }
    get promptContext(): string { return this._props.promptContext; }
    get isCustom(): boolean { return this._props.isCustom; }
    get creatorUserId(): string | null { return this._props.creatorUserId; }
    get createdAt(): Date { return this._props.createdAt; }

    public toJSON(): ScenarioProps {
        return {
            id: this._props.id,
            title: this._props.title,
            description: this._props.description,
            category: this._props.category,
            promptContext: this._props.promptContext,
            isCustom: this._props.isCustom,
            creatorUserId: this._props.creatorUserId,
            createdAt: this._props.createdAt,
        };
    }
}

