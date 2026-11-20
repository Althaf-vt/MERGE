import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { AggregateRoot } from "../../../../shared/domain/events/aggregate-root";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { CastingSessionStatus, TranscriptRole } from "../enums/casting.enums";
import { CASTING_SESSION_POLICY } from "../constants/casting-session.constant";
import { CASTING_ERROR_MESSAGES } from "../constants/casting-error-messages.constant";
import { CastingSessionProps, CastingSessionSnapshot, InternalCastingSessionProps, TranscriptEntry } from "../interfaces/casting-session.types";

export class CastingSession extends AggregateRoot {
    private _props: InternalCastingSessionProps;

    constructor(props: CastingSessionProps) {
        super();
        this._props = {
            ...props,
            status: props.status ?? CastingSessionStatus.IN_PROGRESS,
            transcript: props.transcript ?? [],
            turnCount: props.turnCount ?? 0,
            maxTurns: props.maxTurns ?? CASTING_SESSION_POLICY.DEFAULT_MAX_TURNS,
            personalityVector: props.personalityVector ?? [],
            createdAt: props.createdAt ?? new Date(),
            updatedAt: props.updatedAt ?? new Date(),
        };
    }

    get id(): string | undefined { return this._props.id; }
    get userId(): string { return this._props.userId; }
    get status(): CastingSessionStatus { return this._props.status; }
    get transcript(): TranscriptEntry[] { return [...this._props.transcript]; }
    get turnCount(): number { return this._props.turnCount; }
    get maxTurns(): number { return this._props.maxTurns ?? CASTING_SESSION_POLICY.DEFAULT_MAX_TURNS; }
    get personalityVector(): number[] { return [...(this._props.personalityVector ?? [])]; }
    get aiSummary(): string | undefined { return this._props.aiSummary; }
    get createdAt(): Date | undefined { return this._props.createdAt; }
    get updatedAt(): Date | undefined { return this._props.updatedAt; }

    // Adds a turn to the interview transcript and increments the turn count
    addTurn(role: TranscriptRole, content: string): void {
        if (this._props.status === CastingSessionStatus.COMPLETED) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, CASTING_ERROR_MESSAGES.CONCLUDED_SESSION_TURNS);
        }

        // Block the user from typing more once we hit the limit
        if (this._props.status === CastingSessionStatus.ANALYZING && role === TranscriptRole.USER) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, CASTING_ERROR_MESSAGES.ANALYZING_USER_TURNS);
        }

        if (!content || content.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, CASTING_ERROR_MESSAGES.EMPTY_TRANSCRIPT_CONTENT);
        }

        this._props.transcript.push({
            role,
            content: content.trim(),
            timestamp: new Date(),
        });

        if (role === TranscriptRole.USER) {
            this._props.turnCount += 1;
        }

        // Check if we hit the limit
        if (this._props.status === CastingSessionStatus.IN_PROGRESS && this._props.turnCount >= this.maxTurns) {
            this._props.status = CastingSessionStatus.ANALYZING;
        }

        this._markUpdatedAt();
    }

    // Finalizes the session with the generated vector and AI summary
    completeSession(personalityVector: number[], aiSummary: string): void {
        if (this._props.status === CastingSessionStatus.COMPLETED) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, CASTING_ERROR_MESSAGES.SESSION_ALREADY_COMPLETED);
        }

        if (!personalityVector || personalityVector.length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, CASTING_ERROR_MESSAGES.PERSONALITY_VECTOR_REQUIRED);
        }

        this._props.personalityVector = personalityVector;
        this._props.aiSummary = aiSummary.trim();
        this._props.status = CastingSessionStatus.COMPLETED;
        this._markUpdatedAt();
    }

    private _markUpdatedAt(): void {
        this._props.updatedAt = new Date();
    }

    toJSON(): CastingSessionSnapshot {
        return {
            ...this._props,
            transcript: this._props.transcript.map(entry => ({ ...entry })),
            personalityVector: [...this._props.personalityVector],
        };
    }
}