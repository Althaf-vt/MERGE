// Pure TS interfaces - no decorators, no heavy libs
export interface RegisterUserDto{
    email: string;
    password: string;
    confirmPassword: string;
}

export interface VerifyOtpDto{
    email: string;
    otp: string;
}

export interface LoginUserDto{
    email: string;
    password: string;
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