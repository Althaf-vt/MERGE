import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { PERMISSION_KEY } from "../decorators/require-permissions.decorator";
import { ROLES_KEY } from "../decorators/require-roles.decorator";
import { AdminPermission, AdminRole } from "../../../domain/enums/admin-rbac.enums";

@Injectable()
export class AdminPermissionsGuard implements CanActivate {
    constructor(private readonly _reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        // 1. Extract the required roles and permissions for this specific route
        const requiredRoles = this._reflector.getAllAndOverride<AdminRole[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()]
        );

        const requiredPermissions = this._reflector.getAllAndOverride<AdminPermission[]>(
            PERMISSION_KEY,
            [context.getHandler(), context.getClass()]
        );

        const hasRoleRequirements = Boolean(requiredRoles && requiredRoles.length > 0);
        const hasPermissionRequirements = Boolean(requiredPermissions && requiredPermissions.length > 0);

        // 2. If neither roles nor permissions are required, allow access
        if (!hasRoleRequirements && !hasPermissionRequirements) {
            return true;
        }

        // 3. Extract the user payload from the request (attached by JwtAuthGuard)
        const { user } = context.switchToHttp().getRequest();

        if (!user) {
            throw new ForbiddenException('No authentication payload found.');
        }

        // 4. Role check: if specific roles are required, verify user role matches
        if (hasRoleRequirements && !requiredRoles.includes(user.role)) {
            throw new ForbiddenException('Insufficient role to perform this action.');
        }

        // 5. Permission check: if permissions are required
        if (hasPermissionRequirements) {
            // Super Admins automatically bypass granular permission check
            if (user.role === AdminRole.SUPER_ADMIN) {
                return true;
            }

            // Normal Admins must have every permission required by the route
            const adminPermissions: AdminPermission[] = user.permissions || [];
            const hasAllRequired = requiredPermissions.every(permission => adminPermissions.includes(permission));

            if (!hasAllRequired) {
                throw new ForbiddenException("Insufficient permission to perform this action.");
            }
        }

        return true;
    }
}