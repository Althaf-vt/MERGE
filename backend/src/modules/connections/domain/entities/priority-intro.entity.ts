import { AggregateRoot } from "../../../../shared/domain/events/aggregate-root";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { PRIORITY_INTRO_CONSTANTS, PRIORITY_INTRO_ERROR_MESSAGES } from "../constants/priority-intro.constants";
import { PriorityIntroSentDomainEvent } from "../events/priority-intro-sent.domain-event";

export interface PriorityIntroProps {
    id?: string;
    senderId: string;
    recipientId: string;
    icebreakerMessage: string;
    createdAt?: Date;
}

export type CreatePriorityIntroProps = Pick<PriorityIntroProps, 'senderId' | 'recipientId' | 'icebreakerMessage'>;
export type PriorityIntroData = Required<PriorityIntroProps>;

export class PriorityIntroAggregate extends AggregateRoot {
    private readonly _props: PriorityIntroData;

    constructor(props: PriorityIntroProps) {
        super();
        this._validateInvariants(props);

        this._props = {
            id: props.id ?? '',
            senderId: props.senderId.trim(),
            recipientId: props.recipientId.trim(),
            icebreakerMessage: props.icebreakerMessage.trim(),
            createdAt: props.createdAt ?? new Date(),
        };
    }

    public static send(props: CreatePriorityIntroProps): PriorityIntroAggregate {
        const intro = new PriorityIntroAggregate(props);
        intro.addDomainEvent(new PriorityIntroSentDomainEvent(intro.senderId, intro.recipientId));
        return intro;
    }

    private _validateInvariants(props: PriorityIntroProps): void {
        if (!props.senderId?.trim() || !props.recipientId?.trim()) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, PRIORITY_INTRO_ERROR_MESSAGES.PARTICIPANTS_REQUIRED);
        }

        if (props.senderId.trim() === props.recipientId.trim()) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, PRIORITY_INTRO_ERROR_MESSAGES.CANNOT_SEND_TO_YOURSELF);
        }

        if (!props.icebreakerMessage || !props.icebreakerMessage.trim()) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, PRIORITY_INTRO_ERROR_MESSAGES.ICEBREAKER_REQUIRED);
        }

        if (props.icebreakerMessage.trim().length > PRIORITY_INTRO_CONSTANTS.ICEBREAKER.MAX_LENGTH) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, PRIORITY_INTRO_ERROR_MESSAGES.ICEBREAKER_TOO_LONG);
        }
    }

    // Getters
    get id(): string { return this._props.id; }
    get senderId(): string { return this._props.senderId; }
    get recipientId(): string { return this._props.recipientId; }
    get icebreakerMessage(): string { return this._props.icebreakerMessage; }
    get createdAt(): Date { return this._props.createdAt; }

    public toJSON(): PriorityIntroData {
        return { ...this._props };
    }
}
