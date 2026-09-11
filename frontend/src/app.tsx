import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { RegisterPage } from './features/auth/pages/register.page';
import { LoginPage } from './features/auth/pages/login.page';
import { KycPage } from './features/onboarding/Pages/kyc.page';
import { MobileHandoff } from './features/onboarding/Pages/mobile-handoff.component';
import { PersistLogin } from './features/auth/components/persist-login.component';
import { PublicRoute } from './features/auth/components/public-route.component';
import { PersonaPage } from './features/onboarding/Pages/persona.page';
import { LifestylePage } from './features/onboarding/Pages/lifestyle.page';
import { PreferencesPage } from './features/onboarding/Pages/preferences.page';
import { GenerateBioPage } from './features/onboarding/Pages/generate-bio.page';

// Guards & Post-Onboarding Pages
import { OnboardingGuard } from './features/onboarding/components/onboarding-guard.component';
import { LandingComponent } from './features/onboarding/components/landing-page.component';
import { ProfileLivePage } from './features/onboarding/components/profile-live.page';
import { ForgotPasswordPage } from './features/auth/pages/forgot-password.page';
import { GlobalLayout } from './shared/components/layouts/global.layout.component';
import { SessionInitializer } from './features/auth/components/session-initializer.component';

export const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<GlobalLayout />}>
                    {/* Runs silent background refresh across all routes so TopNav stays authenticated on refresh */}
                    <Route element={<SessionInitializer />}>
                        {/* Landing Page as default root */}
                        <Route path="/" element={<LandingComponent />} />

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
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    );
};