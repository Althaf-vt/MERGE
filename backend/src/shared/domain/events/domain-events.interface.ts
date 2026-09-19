export interface DomainEvent {
    readonly occuredOn: Date;
    readonly eventName: string;
}