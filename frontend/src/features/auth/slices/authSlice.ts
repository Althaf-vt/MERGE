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
    createdAt?: Date | string
}

// Stores the authentication-related UI state used during registration
interface AuthState{
    currentStep: RegistrationStep;
    registeredEmail: string | null;

    // auth session state
    accessToken: string | null;
    refreshToken: string | null;
    user: AuthUser | null;
    isAuthenticated: boolean;
}

// Payload contract for setting authenticated session credentials
interface SetCredentialsPayload{
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
}

// Initial state of the registration flow
const initialState: AuthState = {
    currentStep: 'REGISTER',
    registeredEmail: null,

    // Default unauthenticated session values
    accessToken: null,
    refreshToken: localStorage.getItem('refreshToken'),
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
            const {accessToken, refreshToken, user} = action.payload;

            state.accessToken = accessToken;
            state.refreshToken = refreshToken;
            state.user = user;
            state.isAuthenticated = true;

            localStorage.setItem('refreshToken',refreshToken);
        },

        logout: (state) => {
            state.accessToken = null;
            state.refreshToken = null;
            state.user = null;
            state.isAuthenticated = false;
            state.currentStep = 'REGISTER',
            state.registeredEmail = null;

            // Remove persisted token
            localStorage.removeItem('refreshToken');
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