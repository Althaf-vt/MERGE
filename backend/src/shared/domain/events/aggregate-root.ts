import { DomainEvent } from "./domain-events.interface";

export abstract class AggregateRoot {
    private readonly _domainEvents: DomainEvent[] = [];

    get domainEvents(): DomainEvent[]{
        return [...this._domainEvents];
    }

    protected addDomainEvent(domainEvent: DomainEvent): void{
        this._domainEvents.push(domainEvent);
    }

    public clearDomainEvents(): void{
        this._domainEvents.length = 0;
    }
}