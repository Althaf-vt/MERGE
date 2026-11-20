export interface PriorityIntroProps {
    id?: string;
    senderId: string;
    recipientId: string;
    icebreakerMessage: string;
    createdAt?: Date;
}

export interface CreatePriorityIntroProps {
    senderId: string;
    recipientId: string;
    icebreakerMessage: string;
}

export interface InternalPriorityIntroProps {
    id: string;
    senderId: string;
    recipientId: string;
    icebreakerMessage: string;
    createdAt: Date;
}

export interface PriorityIntroSnapshot {
    id: string;
    senderId: string;
    recipientId: string;
    icebreakerMessage: string;
    createdAt: Date;
}
