import { SetMetadata } from "@nestjs/common";
import { AdminPermission } from "../../../../modules/admin/domain/enums/admin-permission.enums";


export const PERMISSION_KEY = 'permissions';

// Accepts one or more permissions required to access a route
export const RequirePermissions = (...permissions: AdminPermission[]) => 
    SetMetadata(PERMISSION_KEY, permissions);