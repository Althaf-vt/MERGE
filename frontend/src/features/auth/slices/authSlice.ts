import type {PayloadAction} from '@reduxjs/toolkit';
import {createSlice} from '@reduxjs/toolkit';

// Represents the current step of the user registration flow
type RegistrationStep = 'REGISTER' | 'OTP';

// Defines the shape of the authenticated user data stored in the client state
export interface AuthUser{
    id: string;
    email: string;
    isEmailVerified: boolean;
    kycCompleted?: boolean;
    onboardingStep?: number;
    kycVerification?: {
        verificationStatus: string;
        documentType?: string;
    }
    createdAt?: Date | string
}

// Stores the authentication-related UI state used during registration
interface AuthState{
    currentStep: RegistrationStep;
    registeredEmail: string | null;

    // auth session state
    accessToken: string | null;
    user: AuthUser | null;
    isAuthenticated: boolean;
}

// Payload contract for setting authenticated session credentials
interface SetCredentialsPayload{
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
    isAuthenticated: false
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Changes the current step of the registration flow.
        setRegistrationStep: (state, action: PayloadAction<RegistrationStep>) => {
            state.currentStep = action.payload;
        },

        // Stores the email after successful registration for OTP verification
        setRegisteredEmail: (state, action: PayloadAction<string>) => {
            state.registeredEmail = action.payload;
        },

        // Resets the registration flow back to its initial state
        resetRegistration: (state) => {
            state.currentStep = 'REGISTER';
            state.registeredEmail = null;
        },

        setCredentials: (state, action: PayloadAction<SetCredentialsPayload>) => {

            state.accessToken = action.payload.accessToken;
            state.isAuthenticated = true;
            if(action.payload.user){
                state.user = action.payload.user;
            }
        },

        logout: (state) => {
            state.accessToken = null;
            state.user = null;
            state.isAuthenticated = false;
            state.currentStep = 'REGISTER',
            state.registeredEmail = null;
        }
    }
})

export const {
    setRegistrationStep, 
    setRegisteredEmail, 
    resetRegistration,
    setCredentials,
    logout,

} = authSlice.actions;

export default authSlice.reducer;