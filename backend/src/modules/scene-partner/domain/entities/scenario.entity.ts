import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { SCENE_PARTNER_ERROR_MESSAGES, SCENE_PARTNER_POLICY, SCENE_PARTNER_SAFETY } from "../constants/scene-partner.constants";
import { ScenarioCategory } from "../../../../shared/domain/enums/scene-partner.enums";
import { CreateCustomScenarioProps, CreatePredefinedScenarioProps, ScenarioData, ScenarioProps, ScenarioSnapshot, UpdateScenarioDetailsProps } from "../interfaces/scenario.types";

export class Scenario {
    private readonly _props: ScenarioData;

    constructor(props: ScenarioProps) {
        this._validateInvariants(props);

        const now = new Date();
        this._props = {
            id: props.id.trim(),
            title: props.title.trim(),
            description: props.description.trim(),
            category: props.category,
            promptContext: props.promptContext.trim(),
            isCustom: props.isCustom,
            isActive: props.isActive ?? true,
            creatorUserId: props.creatorUserId?.trim() ?? null,
            createdAt: props.createdAt ?? now,
            updatedAt: props.updatedAt ?? props.createdAt ?? now,
        };
    }

    public static createPredefined(params: CreatePredefinedScenarioProps): Scenario {
        return new Scenario({
            ...params,
            isCustom: false,
            isActive: params.isActive ?? true,
            creatorUserId: null,
        });
    }

    public static createCustom(params: CreateCustomScenarioProps): Scenario {
        return new Scenario({
            ...params,
            category: ScenarioCategory.CUSTOM,
            isCustom: true,
            isActive: true,
        });
    }

    public updateDetails(params: UpdateScenarioDetailsProps): void {
        const trimmedTitle = params.title?.trim() ?? "";
        const trimmedDescription = params.description?.trim() ?? "";
        const trimmedPrompt = params.promptContext?.trim() ?? "";

        this._validateInvariants({
            id: this._props.id,
            title: trimmedTitle,
            description: trimmedDescription,
            category: params.category,
            promptContext: trimmedPrompt,
            isCustom: this._props.isCustom,
            creatorUserId: this._props.creatorUserId,
        });

        this._props.title = trimmedTitle;
        this._props.description = trimmedDescription;
        this._props.category = params.category;
        this._props.promptContext = trimmedPrompt;
        this._props.updatedAt = new Date();
    }

    public unlist(): void {
        this._props.isActive = false;
        this._props.updatedAt = new Date();
    }

    public relist(): void {
        this._props.isActive = true;
        this._props.updatedAt = new Date();
    }

    private _validateInvariants(props: ScenarioProps): void {
        if (!props.id || props.id.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, SCENE_PARTNER_ERROR_MESSAGES.SCENARIO_ID_REQUIRED);
        }

        const trimmedTitle = props.title?.trim() ?? "";
        if (
            trimmedTitle.length < SCENE_PARTNER_POLICY.MIN_SCENARIO_TITLE_LENGTH ||
            trimmedTitle.length > SCENE_PARTNER_POLICY.MAX_SCENARIO_TITLE_LENGTH
        ) {
            throw new DomainException(
                ErrorCode.VALIDATION_FAILED,
                SCENE_PARTNER_ERROR_MESSAGES.INVALID_SCENARIO_TITLE_LENGTH(
                    SCENE_PARTNER_POLICY.MIN_SCENARIO_TITLE_LENGTH,
                    SCENE_PARTNER_POLICY.MAX_SCENARIO_TITLE_LENGTH,
                ),
            );
        }

        const trimmedPrompt = props.promptContext?.trim() ?? "";
        if (
            trimmedPrompt.length < SCENE_PARTNER_POLICY.MIN_SCENARIO_PROMPT_LENGTH ||
            trimmedPrompt.length > SCENE_PARTNER_POLICY.MAX_SCENARIO_PROMPT_LENGTH
        ) {
            throw new DomainException(
                ErrorCode.VALIDATION_FAILED,
                SCENE_PARTNER_ERROR_MESSAGES.INVALID_SCENARIO_PROMPT_LENGTH(
                    SCENE_PARTNER_POLICY.MIN_SCENARIO_PROMPT_LENGTH,
                    SCENE_PARTNER_POLICY.MAX_SCENARIO_PROMPT_LENGTH,
                ),
            );
        }

        if (props.isCustom && (!props.creatorUserId || props.creatorUserId.trim().length === 0)) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, SCENE_PARTNER_ERROR_MESSAGES.CREATOR_USER_ID_REQUIRED);
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
    get isActive(): boolean { return this._props.isActive; }
    get creatorUserId(): string | null { return this._props.creatorUserId; }
    get createdAt(): Date { return this._props.createdAt; }
    get updatedAt(): Date { return this._props.updatedAt; }

    public toJSON(): ScenarioSnapshot {
        return {
            id: this._props.id,
            title: this._props.title,
            description: this._props.description,
            category: this._props.category,
            promptContext: this._props.promptContext,
            isCustom: this._props.isCustom,
            isActive: this._props.isActive,
            creatorUserId: this._props.creatorUserId,
            createdAt: this._props.createdAt,
            updatedAt: this._props.updatedAt,
        };
    }
}
