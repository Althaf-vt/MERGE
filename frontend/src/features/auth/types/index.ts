// Pure TS interfaces - no decorators, no heavy libs
export interface RegisterUserDto{
    email: string;
    password: string;
}

export interface VerifyOtpDto{
    email: string;
    otp: string;
}

// shape of the successful response
export interface AuthResponse {
    message: string;
    user: {
        id: string;
        email: string;
        isEmailVerified: boolean;
        accountStatus: string;
        onboardingStep: number;
        createdAt: string
    }
}