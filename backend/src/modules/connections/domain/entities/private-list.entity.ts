import { AggregateRoot } from "../../../../shared/domain/events/aggregate-root";
import { PrivateListType } from "../enums/connection.enums";

export interface PrivateListProps {
    id?: string;
    userId: string;
    targetUserId: string;
    listType: PrivateListType;
    createdAt?: Date;
}

export class PrivateListAggregate extends AggregateRoot {
    private _props: Required<PrivateListProps>;

    constructor(props: PrivateListProps) {
        super();
        this._props = {
            ...props,
            id: props.id ?? '',
            createdAt: props.createdAt ?? new Date(),
        } as Required<PrivateListProps>;
    }

    get id(): string { return this._props.id; }
    get userId(): string { return this._props.userId; }
    get targetUserId(): string { return this._props.targetUserId; }
    get listType(): PrivateListType { return this._props.listType; }

    public toJSON(): Record<string, unknown> {
        return { ...this._props };
    }
}