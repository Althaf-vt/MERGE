import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { AggregateRoot } from "../../../../shared/domain/events/aggregate-root";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { CastingSessionStatus, TranscriptRole } from "../enums/casting.enums";

export interface TranscriptEntry {
    role: TranscriptRole;
    content: string;
    timestamp: Date;
}

export interface CastingSessionProps {
    id?: string;
    userId: string;
    status: CastingSessionStatus;
    transcript: TranscriptEntry[];
    turnCount: number;
    maxTurns?: number;
    personalityVector?: number[];
    aiSummary?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export class CastingSession extends AggregateRoot {
    private _props: CastingSessionProps;
    private readonly _DEFAULT_MAX_TURNS = 7;

    constructor(props: CastingSessionProps) {
        super();
        this._props = {
            ...props,
            status: props.status ?? 'IN_PROGRESS',
            transcript: props.transcript ?? [],
            turnCount: props.turnCount ?? 0,
            maxTurns: props.maxTurns ?? this._DEFAULT_MAX_TURNS,
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
    get maxTurns(): number { return this._props.maxTurns ?? this._DEFAULT_MAX_TURNS; }
    get personalityVector(): number[] { return [...(this._props.personalityVector ?? [])]; }
    get aiSummary(): string | undefined { return this._props.aiSummary; }
    get createdAt(): Date | undefined { return this._props.createdAt; }
    get updatedAt(): Date | undefined { return this._props.updatedAt; }

    // Adds a turn to the interview transcript and increments the turn count
    addTurn(role: TranscriptRole, content: string): void {
        if (this._props.status === 'COMPLETED') {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Cannot add turns to a concluded casting session.');
        }

        // Block the user from typing more once we hit the limit
        if (this._props.status === 'ANALYZING' && role === 'user') {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Cannot add user turns while the session is analyzing.');
        }

        if (!content || content.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Transcript content cannot be empty.');
        }

        this._props.transcript.push({
            role,
            content: content.trim(),
            timestamp: new Date(),
        });

        if (role == 'user') {
            this._props.turnCount += 1;
        }

        // Check if we hit the limit
        if (this._props.status === 'IN_PROGRESS' && this._props.turnCount >= this.maxTurns) {
            this._props.status = 'ANALYZING';
        }

        this._markUpdatedAt();
    }

    // Finalizes the session with the generated vector and AI summary
    completeSession(personalityVerctor: number[], aiSummary: string): void {
        if (this._props.status === 'COMPLETED') {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Casting session is already completed.');
        }

        if (!personalityVerctor || personalityVerctor.length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, 'Personality vector embedding is required.');
        }

        this._props.personalityVector = personalityVerctor;
        this._props.aiSummary = aiSummary.trim();
        this._props.status = 'COMPLETED';
        this._markUpdatedAt();
    }

    private _markUpdatedAt(): void {
        this._props.updatedAt = new Date();
    }

    toJSON() {
        return { ...this._props };
    }
}