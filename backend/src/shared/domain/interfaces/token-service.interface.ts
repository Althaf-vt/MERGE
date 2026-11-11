export const TOKEN_SERVICE = Symbol('TOKEN_SERVICE');

// Defines the data stored inside an authentication token.
export interface ITokenPayload{
    userId: string;
    email: string;
    role: string;
    sessionId?: string;
    permissions?: string[]; // admin permissions
}

// Defines the operation required for generating and verifying authenticationt tokens.
export interface ITokenservice{
    generateAccessToken(payload: ITokenPayload): string;
    generateRefreshToken(payload: ITokenPayload): string;
    verifyAccessToken(token: string): ITokenPayload | null;
    verifyRefreshToken(token: string): ITokenPayload | null;
}