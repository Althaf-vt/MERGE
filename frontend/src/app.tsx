import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { RegisterPage } from './features/auth/pages/RegisterPage';
import { LoginPage } from './features/auth/pages/LoginPage';
import { KycPage } from './features/onboarding/Pages/KycPage';
import { MobileHandoff } from './features/onboarding/Pages/mobile-handoff.component';
import { PersistLogin } from './features/auth/components/PersistLogin';
import { PublicRoute } from './features/auth/components/PublicRoute';
import { PersonaPage } from './features/onboarding/Pages/PersonaPage';
import { LifestylePage } from './features/onboarding/Pages/LifestylePage';
import { PreferencesPage } from './features/onboarding/Pages/PreferencesPage';
import { GenerateBioPage } from './features/onboarding/Pages/generate-bio.page';

// Guards & Post-Onboarding Pages
import { OnboardingGuard } from './features/onboarding/components/onboarding-guard.component';
import { LandingPage } from './features/onboarding/components/landing.page';
import { ProfileLivePage } from './features/onboarding/components/profile-live.page';
import { ForgotPasswordPage } from './features/auth/pages/forgot-password.page';

export const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Landing Page as default root */}
                <Route path="/" element={<LandingPage />} />

                {/* AUTHENTICATION ROUTES */}
                <Route element={<PublicRoute />}>
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path='/forgot-password' element={<ForgotPasswordPage/>} />
                </Route>

                {/* Public Mobile Handoff */}
                <Route path="/handoff" element={<MobileHandoff />} />

                {/* PROTECTED ROUTES */}
                <Route element={<PersistLogin />}>
                    {/* Post-onboarding success page */}
                    <Route path="/profile-live" element={<ProfileLivePage />} />

                    {/* 
                        ONBOARDING ROUTES
                        Nested inside OnboardingGuard so completed users 
                        are automatically redirected to /profile-live
                    */}
                    <Route element={<OnboardingGuard />}>
                        <Route path="/onboarding/kyc" element={<KycPage />} />
                        <Route path="/onboarding/profile" element={<PersonaPage />} />
                        <Route path="/onboarding/lifestyle" element={<LifestylePage />} />
                        <Route path="/onboarding/preferences" element={<PreferencesPage />} />
                        <Route path="/onboarding/bio" element={<GenerateBioPage />} />
                    </Route>
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<div>404 - Page Not Found</div>} />
            </Routes>
        </BrowserRouter>
    );
};