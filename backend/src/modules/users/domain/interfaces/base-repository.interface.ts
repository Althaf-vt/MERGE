export interface IBaseRepository<T> {
    findById(id: string): Promise<T | null>;
    create(entity: T): Promise<T>;
    update(entity: T): Promise<T>;
}