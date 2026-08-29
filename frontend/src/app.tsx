import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom'
import { RegisterPage } from './features/auth/pages/RegisterPage'
import { LoginPage } from './features/auth/pages/LoginPage'
import { KycPage } from './features/onboarding/Pages/KycPage'

// Placeholder components for future routes we will build
// const LoginPage = () => <div>Login Page (Coming Soon)</div>
// const KycOnboardingPage = () => <div>KYC Onboarding (Coming Soon)</div>


export const App = () => {
    return(
        <BrowserRouter>
        {/* 
            This is where you could place a global layout wrapper,
            persistent navigation bars, or toast notification providers
        */}

        <Routes>
            {/* Redirect the roor URL to login or register by default */}
            <Route path='/' element={<Navigate to='/register' replace />}/>

            {/* ---AUTHENTICATION ROUTES--- */}

            {/* 
                RegisterPage internally handles the switch between
                the Email/Password from the OTP Verification screen
                using the Redux authSlice we built.
            */}

            <Route path='/register' element={<RegisterPage/>}/>

            <Route path='/login' element={<LoginPage/>}/>

            {/* --- ONBOARDING ROUTES --- */}

            {/* Users will be redirected here after successful OTP verification */}
            <Route path="/onboarding/kyc" element={<KycPage />} />

            {/* Catch-all for 404 Not Found */}
            <Route path='*' element={<div>404 - Page Not Found</div>} />
        </Routes>
        </BrowserRouter>
    )
}