import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type {
    UserMedical,
    UserPhoto,
    UserPreferenceDetails,
    UserPrivacy,
    UserProfileDetails,
} from '../../profile/types/profile.types';

// Represents the current step of the user registration flow
export type RegistrationStep = 'REGISTER' | 'OTP';

// Defines the shape of the authenticated user data stored in the client state
export interface AuthUser {
    id: string;
    email: string;
    authProvider?: string;
    isEmailVerified: boolean;
    kycCompleted?: boolean;
    onboardingStep?: number;
    profileCompleted?: boolean;
    onboardingCompleted?: boolean;
    castingDirectorCompleted?: boolean;
    profile?: UserProfileDetails | null;
    preference?: UserPreferenceDetails | null;
    photos?: UserPhoto[];
    medicalRecord?: UserMedical | null;
    privacySettings?: UserPrivacy | null;
    kycVerification?: {
        verificationStatus: string;
        documentType?: string;
        selfieVerificationStatus?: string;
        verificationSubmitted?: boolean;
        passedPrompts?: string[];
        reviewDecision?: string;
        verifiedDOB?: Date | string;
    };
    createdAt?: Date | string;
}

// Stores the authentication-related UI state used during registration
interface AuthState {
    currentStep: RegistrationStep;
    registeredEmail: string | null;

    // auth session state
    accessToken: string | null;
    user: AuthUser | null;
    isAuthenticated: boolean;
    isInitializing: boolean;
}

// Payload contract for setting authenticated session credentials
interface SetCredentialsPayload {
    accessToken: string;
    user?: AuthUser;
}

// Initial state of the registration flow
const initialState: AuthState = {
    currentStep: 'REGISTER',
    registeredEmail: null,

    // Default unauthenticated session values
    accessToken: null,
    user: null,
    isAuthenticated: false,
    isInitializing: true,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setRegistrationStep: (state, action: PayloadAction<RegistrationStep>) => {
            state.currentStep = action.payload;
        },

        setRegisteredEmail: (state, action: PayloadAction<string>) => {
            state.registeredEmail = action.payload;
        },

        resetRegistration: (state) => {
            state.currentStep = 'REGISTER';
            state.registeredEmail = null;
        },

        setCredentials: (state, action: PayloadAction<SetCredentialsPayload>) => {
            state.accessToken = action.payload.accessToken;
            state.isAuthenticated = true;
            if (action.payload.user) {
                state.user = action.payload.user;
            }
            state.isInitializing = false;
        },

        setInitialized: (state) => {
            state.isInitializing = false;
        },

        logout: (state) => {
            state.accessToken = null;
            state.user = null;
            state.isAuthenticated = false;
            state.currentStep = 'REGISTER';
            state.registeredEmail = null;
        },
    },
});

export const {
    setRegistrationStep,
    setRegisteredEmail,
    resetRegistration,
    setCredentials,
    setInitialized,
    logout,
} = authSlice.actions;

export default authSlice.reducer;