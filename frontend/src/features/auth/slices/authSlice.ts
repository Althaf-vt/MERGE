import {createSlice, PayloadAction} from '@reduxjs/toolkit';

// Represents the current step of the user registration flow
type RegistrationStep = 'REGISTER' | 'OTP';

// Stores the authentication-related UI state used during registration
interface AuthState{
    currentStep: RegistrationStep;
    registeredEmail: string | null;
}

// Initial state of the registration flow
const initialState: AuthState = {
    currentStep: 'REGISTER',
    registeredEmail: null,
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
        }
    }
})

export const {setRegistrationStep, setRegisteredEmail, resetRegistration} = authSlice.actions;
export default authSlice.reducer;