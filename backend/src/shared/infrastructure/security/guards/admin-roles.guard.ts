import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/require-roles.decorator";
import { AdminRole } from "../../../domain/enums/admin-rbac.enums";

@Injectable()
export class AdminRolesGuard implements CanActivate {
    constructor(private readonly _reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this._reflector.getAllAndOverride<AdminRole[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()]
        );

        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();

        if (!user) {
            throw new ForbiddenException('No authentication payload found.');
        }

        if (!requiredRoles.includes(user.role)) {
            throw new ForbiddenException('Insufficient role to perform this action.');
        }

        return true;
    }
}