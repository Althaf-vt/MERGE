import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export interface ClientInfoData {
    ipAddress: string;
    deviceInfo: string;
}

export const ClientInfo = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): ClientInfoData => {
        const request = ctx.switchToHttp().getRequest();

        const ipAddress = (request.headers['x-forwarded-for'] as string) 
            || request.socket.remoteAddress
            || 'unknown';

        const deviceInfo = request.headers['user-agent'] || 'unknown device';
        
        return {ipAddress, deviceInfo}
    },
)