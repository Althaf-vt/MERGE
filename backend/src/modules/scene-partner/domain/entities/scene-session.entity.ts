import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { AggregateRoot } from "../../../../shared/domain/events/aggregate-root";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { SCENE_PARTNER_ERROR_MESSAGES, SCENE_PARTNER_POLICY, SCENE_PARTNER_SAFETY } from "../constants/scene-partner.constants";
import { ScenarioCategory, SceneSessionStatus, SceneSpeakerRole, SimulationType } from "../enums/scene-partner.enums";
import { CoachNoteVO } from "../value-objects/coach-note.vo";
import { SceneSessionSummaryData } from "../interfaces/scene-partner-ai.interface";
import {
    CreateSceneSessionProps,
    SceneSessionData,
    SceneSessionProps,
    SceneSessionSnapshot,
    SceneTurn,
} from "../interfaces/scene-session.types";

export class SceneSession extends AggregateRoot {
    private readonly _props: SceneSessionData;

    constructor(props: SceneSessionProps) {
        super();
        this._validateCreationInvariants(props);

        this._props = {
            id: props.id?.trim() ?? '',
            userId: props.userId.trim(),
            simulationType: props.simulationType,
            scenarioId: props.scenarioId.trim(),
            scenarioTitle: props.scenarioTitle.trim(),
            scenarioCategory: props.scenarioCategory,
            targetUserId: props.targetUserId?.trim() ?? null,
            status: props.status ?? SceneSessionStatus.INITIALIZING,
            transcript: props.transcript ? [...props.transcript] : [],
            turnCount: props.turnCount ?? (props.transcript ? props.transcript.filter((t) => t.role === SceneSpeakerRole.USER).length : 0),
            summary: props.summary ?? null,
            maxDurationMinutes: props.maxDurationMinutes ?? SCENE_PARTNER_POLICY.DEFAULT_MAX_DURATION_MINUTES,
            pausedAt: props.pausedAt ?? null,
            totalPausedMs: props.totalPausedMs ?? 0,
            completedAt: props.completedAt ?? null,
            createdAt: props.createdAt ?? new Date(),
            updatedAt: props.updatedAt ?? new Date(),
        };
    }

    public static create(props: CreateSceneSessionProps): SceneSession {
        return new SceneSession({
            ...props,
            status: SceneSessionStatus.INITIALIZING,
            transcript: [],
            turnCount: 0,
            summary: null,
            pausedAt: null,
            totalPausedMs: 0,
            completedAt: null,
        });
    }

    private _validateCreationInvariants(props: SceneSessionProps): void {
        if (!props.userId || props.userId.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, SCENE_PARTNER_ERROR_MESSAGES.USER_ID_REQUIRED);
        }

        if (!props.scenarioId || props.scenarioId.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, SCENE_PARTNER_ERROR_MESSAGES.SCENARIO_REQUIRED);
        }

        if (props.simulationType === SimulationType.MATCH_BASED) {
            if (!props.targetUserId || props.targetUserId.trim().length === 0) {
                throw new DomainException(ErrorCode.VALIDATION_FAILED, SCENE_PARTNER_ERROR_MESSAGES.TARGET_USER_REQUIRED_FOR_MATCH);
            }
            if (props.userId.trim() === props.targetUserId.trim()) {
                throw new DomainException(ErrorCode.VALIDATION_FAILED, SCENE_PARTNER_ERROR_MESSAGES.CANNOT_SIMULATE_SELF);
            }
        }
    }

    // Getters
    get id(): string { return this._props.id; }
    get userId(): string { return this._props.userId; }
    get simulationType(): SimulationType { return this._props.simulationType; }
    get scenarioId(): string { return this._props.scenarioId; }
    get scenarioTitle(): string { return this._props.scenarioTitle; }
    get scenarioCategory(): ScenarioCategory { return this._props.scenarioCategory; }
    get targetUserId(): string | null { return this._props.targetUserId; }
    get status(): SceneSessionStatus { return this._props.status; }
    get transcript(): SceneTurn[] { return [...this._props.transcript]; }
    get turnCount(): number { return this._props.turnCount; }
    get summary(): SceneSessionSummaryData | null { return this._props.summary ? { ...this._props.summary } : null; }
    get maxDurationMinutes(): number { return this._props.maxDurationMinutes; }
    get pausedAt(): Date | null { return this._props.pausedAt; }
    get totalPausedMs(): number { return this._props.totalPausedMs; }
    get completedAt(): Date | null { return this._props.completedAt; }
    get createdAt(): Date { return this._props.createdAt; }
    get updatedAt(): Date { return this._props.updatedAt; }

    // Queries
    public isOwner(actionUserId: string): boolean {
        return this._props.userId === actionUserId;
    }

    public isInProgress(): boolean {
        return this._props.status === SceneSessionStatus.IN_PROGRESS;
    }

    public isPaused(): boolean {
        return this._props.status === SceneSessionStatus.PAUSED;
    }

    public isCompleted(): boolean {
        return this._props.status === SceneSessionStatus.COMPLETED;
    }

    public getActiveDurationMinutes(now: Date = new Date()): number {
        const endTime = this._props.completedAt ?? (this._props.pausedAt ?? now);
        const elapsedMs = endTime.getTime() - this._props.createdAt.getTime() - this._props.totalPausedMs;
        const netMs = Math.max(0, elapsedMs);
        return Math.floor(netMs / (1000 * 60));
    }

    public isDurationExceeded(now: Date = new Date()): boolean {
        return this.getActiveDurationMinutes(now) >= this._props.maxDurationMinutes;
    }

    // State Transitions & Turn Management (Intention-Revealing Methods)
    public startSession(openingMessage: string): void {
        if (this._props.status !== SceneSessionStatus.INITIALIZING) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, SCENE_PARTNER_ERROR_MESSAGES.INVALID_STATUS_FOR_TURN(this._props.status));
        }

        if (!openingMessage || openingMessage.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, SCENE_PARTNER_ERROR_MESSAGES.SIMULATION_REPLY_EMPTY);
        }

        const now = new Date();
        this._props.transcript.push({
            role: SceneSpeakerRole.SIMULATION,
            content: openingMessage.trim(),
            coachNote: null,
            timestamp: now,
        });

        this._props.status = SceneSessionStatus.IN_PROGRESS;
        this._props.updatedAt = now;
    }

    public addUserTurn(actionUserId: string, content: string): void {
        this._assertOwnership(actionUserId);

        if (this._props.status !== SceneSessionStatus.IN_PROGRESS) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, SCENE_PARTNER_ERROR_MESSAGES.INVALID_STATUS_FOR_TURN(this._props.status));
        }

        if (this.isDurationExceeded()) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, SCENE_PARTNER_ERROR_MESSAGES.DURATION_EXCEEDED);
        }

        const trimmed = content?.trim() ?? '';
        if (trimmed.length < SCENE_PARTNER_POLICY.MIN_MESSAGE_LENGTH) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, SCENE_PARTNER_ERROR_MESSAGES.MESSAGE_EMPTY);
        }

        if (trimmed.length > SCENE_PARTNER_POLICY.MAX_MESSAGE_LENGTH) {
            throw new DomainException(
                ErrorCode.VALIDATION_FAILED,
                SCENE_PARTNER_ERROR_MESSAGES.MESSAGE_TOO_LONG(SCENE_PARTNER_POLICY.MAX_MESSAGE_LENGTH)
            );
        }

        // Layer 1 Content Safety Guardrail: Prevent abusive, obscene, or derogatory messages
        if (SCENE_PARTNER_SAFETY.PROHIBITED_CONTENT_REGEX.test(trimmed)) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, SCENE_PARTNER_ERROR_MESSAGES.INAPPROPRIATE_CONTENT);
        }

        const now = new Date();
        this._props.transcript.push({
            role: SceneSpeakerRole.USER,
            content: trimmed,
            coachNote: null,
            timestamp: now,
        });

        this._props.turnCount += 1;
        this._props.updatedAt = now;
    }

    public addSimulationTurn(personaReply: string, coachNote: CoachNoteVO | null = null): void {
        if (this._props.status !== SceneSessionStatus.IN_PROGRESS) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, SCENE_PARTNER_ERROR_MESSAGES.INVALID_STATUS_FOR_TURN(this._props.status));
        }

        const trimmedReply = personaReply?.trim() ?? '';
        if (trimmedReply.length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, SCENE_PARTNER_ERROR_MESSAGES.SIMULATION_REPLY_EMPTY);
        }

        const now = new Date();
        this._props.transcript.push({
            role: SceneSpeakerRole.SIMULATION,
            content: trimmedReply,
            coachNote,
            timestamp: now,
        });

        this._props.updatedAt = now;
    }

    public pause(actionUserId: string): void {
        this._assertOwnership(actionUserId);

        if (this._props.status !== SceneSessionStatus.IN_PROGRESS) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, SCENE_PARTNER_ERROR_MESSAGES.INVALID_STATUS_FOR_PAUSE);
        }

        const now = new Date();
        this._props.status = SceneSessionStatus.PAUSED;
        this._props.pausedAt = now;
        this._props.updatedAt = now;
    }

    public resume(actionUserId: string): void {
        this._assertOwnership(actionUserId);

        if (this._props.status !== SceneSessionStatus.PAUSED) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, SCENE_PARTNER_ERROR_MESSAGES.INVALID_STATUS_FOR_RESUME);
        }

        const now = new Date();
        if (this._props.pausedAt) {
            this._props.totalPausedMs += now.getTime() - this._props.pausedAt.getTime();
            this._props.pausedAt = null;
        }

        this._props.status = SceneSessionStatus.IN_PROGRESS;
        this._props.updatedAt = now;
    }

    public complete(actionUserId: string, summary: SceneSessionSummaryData): void {
        this._assertOwnership(actionUserId);

        if (this._props.status === SceneSessionStatus.COMPLETED) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, SCENE_PARTNER_ERROR_MESSAGES.INVALID_STATUS_FOR_COMPLETE);
        }

        const now = new Date();
        if (this._props.status === SceneSessionStatus.PAUSED && this._props.pausedAt) {
            this._props.totalPausedMs += now.getTime() - this._props.pausedAt.getTime();
            this._props.pausedAt = null;
        }

        this._props.status = SceneSessionStatus.COMPLETED;
        this._props.summary = { ...summary };
        this._props.completedAt = now;
        this._props.updatedAt = now;
    }

    private _assertOwnership(actionUserId: string): void {
        if (!this.isOwner(actionUserId)) {
            throw new DomainException(ErrorCode.FORBIDDEN, SCENE_PARTNER_ERROR_MESSAGES.NOT_SESSION_OWNER);
        }
    }

    public toJSON(): SceneSessionSnapshot {
        return {
            id: this._props.id,
            userId: this._props.userId,
            simulationType: this._props.simulationType,
            scenarioId: this._props.scenarioId,
            scenarioTitle: this._props.scenarioTitle,
            scenarioCategory: this._props.scenarioCategory,
            targetUserId: this._props.targetUserId,
            status: this._props.status,
            transcript: this._props.transcript.map((t) => ({
                role: t.role,
                content: t.content,
                coachNote: t.coachNote ? t.coachNote.toJSON() : null,
                timestamp: t.timestamp,
            })),
            turnCount: this._props.turnCount,
            summary: this._props.summary ? { ...this._props.summary } : null,
            maxDurationMinutes: this._props.maxDurationMinutes,
            pausedAt: this._props.pausedAt,
            totalPausedMs: this._props.totalPausedMs,
            completedAt: this._props.completedAt,
            createdAt: this._props.createdAt,
            updatedAt: this._props.updatedAt,
        };
    }
}
