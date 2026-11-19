import { ModerationAction } from "../enums/moderation.enums";
import { ModerationLogProps, ModerationLogSnapshot } from "../interfaces/moderation-log.types";

export class ModerationLog {
    private readonly _props: ModerationLogProps;

    constructor(props: ModerationLogProps) {
        this._props = {
            ...props,
            createdAt: props.createdAt ?? new Date(),
        };
    }

    get id(): string | undefined { return this._props.id; }
    get targetUserId(): string { return this._props.targetUserId; }
    get adminId(): string { return this._props.adminId; }
    get action(): ModerationAction { return this._props.action; }
    get reason(): string { return this._props.reason; }
    get durationContext(): string | undefined { return this._props.durationContext; }
    get createdAt(): Date | undefined { return this._props.createdAt; }

    toJSON(): ModerationLogSnapshot {
        return { ...this._props };
    }
}