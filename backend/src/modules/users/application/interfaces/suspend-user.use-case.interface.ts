import { FacadeSuspensionUnit } from "./user-management-facade.interface";

export interface ISuspendUserUseCase {
    execute(userId: string, duration: number, unit: FacadeSuspensionUnit, reason: string): Promise<void>;
}

export const SUSPEND_USER_USE_CASE = Symbol('SUSPEND_USER_USE_CASE');
