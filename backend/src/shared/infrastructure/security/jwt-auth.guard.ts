import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { Observable } from "rxjs";

// Extend the Express Request to include our custom user property
interface AuthenticatedRequest extends Request{
    user?: any;
}

@Injectable()
export class JwtAuthGuard implements CanActivate{
    constructor(private readonly jwtService: JwtService){}

    async canActivate(context: ExecutionContext): Promise<boolean> {

        // 1. Access the incoming HTTP request before it reached the controller
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

        // 2. Pluck the token out of the 'Authorization' header
        const token = this.extractTokenFromHeader(request);

        if(!token){
            throw new UnauthorizedException("Authentication token is missing");
        }

        try {
            // 3. Cryptographically verify the token hasn't been tampered with or expired
            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_ACCESS_SECRET || 'fallback-access-secret'
            });

            // 4. Mount the decoded data onto the request object
            // This is the magic step that makes 'req.user.userId' work in your controllers
            request.user = payload;

        } catch (error) {
            throw new UnauthorizedException('Invalid or expired access token');
        }

        // 5. Green light. Let the request proceed to the route handler
        return true
    
    }

    // Helper to split "Bearer <token> and return just the token string"
    private extractTokenFromHeader(request: Request): string | undefined{
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}