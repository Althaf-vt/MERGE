import { Injectable, Logger } from "@nestjs/common";
import { OAuth2Client } from "google-auth-library";
import { IGoogleAuthService } from "../../domain/interfaces/google-auth-service.interface";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";

@Injectable()
export class GoogleAuthService implements IGoogleAuthService {
    private readonly _googleClient: OAuth2Client;
    private readonly _logger = new Logger(GoogleAuthService.name);

    constructor() {
        this._googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    }

    async verifyToken(idToken: string): Promise<{ email: string } | null> {
        try {
            const ticket = await this._googleClient.verifyIdToken({
                idToken,
                audience: process.env.GOOGLE_CLIENT_ID
            });
            
            const payload = ticket.getPayload();
            if (!payload || !payload.email) {
                return null;
            }

            return { email: payload.email };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this._logger.error(`Google token verification failed: ${errorMessage}`);
            throw new DomainException(ErrorCode.INVALID_CREDENTIALS, "Google token verification failed.");
        }
    }
}