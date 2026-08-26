// Unique DI token used to identify the TokenService implementation.
export const TOKEN_SERVICE = Symbol('TOKEN_SERVICE');

// Defines the data stored inside an authentication token.
export interface ITokenPayload{
    userId: string;
    email: string;
    role: string;
}

// Defines the operation required for generating and verifying authenticationt tokens.
export interface ITokenservice{
    generateAccessToken(payload: ITokenPayload): string;
    generateRefreshToken(payload: ITokenPayload): string;
    verifyAccessToken(token: string): ITokenPayload;
    verifyRefreshToken(token: string): ITokenPayload;
}