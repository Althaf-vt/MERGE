import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom'
import { RegisterPage } from './features/auth/pages/RegisterPage'
import { LoginPage } from './features/auth/pages/LoginPage'
import { KycPage } from './features/onboarding/Pages/KycPage'
import { MobileHandoff } from './features/onboarding/Pages/MobileHandoff'
import { PersistLogin } from './features/auth/components/PersistLogin'
import { PublicRoute } from './features/auth/components/PublicRoute'

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
            {/* 1. Public-Only routes (redirects authenticated user away from login/register) */}
            <Route element={<PublicRoute/>}>
                <Route path='/register' element={<RegisterPage/>}/>
                <Route path='/login' element={<LoginPage/>}/>
            </Route>

            {/* 2. Public Mobile Handoff (Self-authenticating token endpoint) */}
            <Route path='/handoff' element={<MobileHandoff/>} />

            {/* 3. Protected Routes (Wrapped in PersistLogin for session restoration) */}
            <Route element={<PersistLogin/>}>

                {/* --- ONBOARDING ROUTES --- */}

                {/* Users will be redirected here after successful OTP verification */}
                <Route path="/onboarding/kyc" element={<KycPage />} />

            </Route>

            {/* Catch-all for 404 Not Found */}
            <Route path='*' element={<div>404 - Page Not Found</div>} />
        </Routes>
        </BrowserRouter>
    )
}