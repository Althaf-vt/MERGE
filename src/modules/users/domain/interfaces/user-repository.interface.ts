import { UserAggregate } from "../entities/user.entity";

// Unique DI token used to identify the UserRepository implementation.
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

// Defines the contracts for accessing and managing User data.
// Keeps the application independent of the database implementation.
export interface IUserRepository{
    findByEmail(email: string): Promise<UserAggregate | null>;
    findById(id: string): Promise<UserAggregate | null>;
    create(user: UserAggregate): Promise<UserAggregate>;
    update(user: UserAggregate): Promise<UserAggregate>;
}