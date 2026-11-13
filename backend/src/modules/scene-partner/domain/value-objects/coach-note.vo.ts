import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { SCENE_PARTNER_ERROR_MESSAGES } from "../constants/scene-partner.constants";

export interface CoachNoteProps {
    observation: string;
    tone: string;
    pacing: string;
    nextTip: string;
}

export class CoachNoteVO {
    private readonly _observation: string;
    private readonly _tone: string;
    private readonly _pacing: string;
    private readonly _nextTip: string;

    constructor(props: CoachNoteProps) {
        this._validateInvariants(props);

        this._observation = props.observation.trim();
        this._tone = props.tone.trim();
        this._pacing = props.pacing.trim();
        this._nextTip = props.nextTip.trim();
    }

    public static create(props: CoachNoteProps): CoachNoteVO {
        return new CoachNoteVO(props);
    }

    private _validateInvariants(props: CoachNoteProps): void {
        if (!props) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, SCENE_PARTNER_ERROR_MESSAGES.COACH_NOTE_REQUIRED);
        }

        if (!props.observation || props.observation.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, SCENE_PARTNER_ERROR_MESSAGES.COACH_OBSERVATION_REQUIRED);
        }

        if (!props.tone || props.tone.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, SCENE_PARTNER_ERROR_MESSAGES.COACH_TONE_REQUIRED);
        }

        if (!props.pacing || props.pacing.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, SCENE_PARTNER_ERROR_MESSAGES.COACH_PACING_REQUIRED);
        }

        if (!props.nextTip || props.nextTip.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, SCENE_PARTNER_ERROR_MESSAGES.COACH_NEXT_TIP_REQUIRED);
        }
    }

    get observation(): string { return this._observation; }
    get tone(): string { return this._tone; }
    get pacing(): string { return this._pacing; }
    get nextTip(): string { return this._nextTip; }

    public equals(other: CoachNoteVO): boolean {
        if (!other) return false;
        return (
            this._observation === other.observation &&
            this._tone === other.tone &&
            this._pacing === other.pacing &&
            this._nextTip === other.nextTip
        );
    }

    public toJSON(): CoachNoteProps {
        return {
            observation: this._observation,
            tone: this._tone,
            pacing: this._pacing,
            nextTip: this._nextTip,
        };
    }
}

