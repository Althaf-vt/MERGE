import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { PERMISSION_KEY } from "../decorators/require-permissions.decorator";
import { AdminPermission } from "../../../../modules/admin/domain/enums/admin-permission.enums";
import { AdminRole } from "../../../../modules/admin/domain/enums/admin.enums";


@Injectable()
export class AdminPermissionsGuard implements CanActivate {
    constructor(private readonly _reflector: Reflector){}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        // 1. Extract the required permissions for this specific route
        const requiredPermissions = this._reflector.getAllAndOverride<AdminPermission[]>(
            PERMISSION_KEY,
            [context.getHandler(), context.getClass()]
        );

        // 2. If no permissions are required, allow access
        if(!requiredPermissions || requiredPermissions.length === 0){
            return true;
        }

        // 3. Extract the user payload from the request (attached by JwtAuthGuard)
        const {user} = context.switchToHttp().getRequest();

        if(!user){
            throw new ForbiddenException('No authentication payload found.');
        }

        // 4. Super Admins automatically bypass granular permission check
        if(user.role === AdminRole.SUPER_ADMIN){
            return true;
        }

        // 5. Normal Admins must have every permission required by the route
        const adminPermissions: AdminPermission[] = user.permissions || [];
        const hasAllRequired = requiredPermissions.every(permission => adminPermissions.includes(permission));

        if(!hasAllRequired){
            throw new ForbiddenException("Insufficient permission to perform this action.");
        }

        return true;
    }
}