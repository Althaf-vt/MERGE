import { SetMetadata } from "@nestjs/common";
import { AdminRole } from "../../../domain/enums/admin-rbac.enums";

export const ROLES_KEY = 'roles';

// Accepts one or more roles required to access a route
export const RequireRoles = (...roles: AdminRole[]) => 
    SetMetadata(ROLES_KEY, roles);

