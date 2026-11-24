import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../../../app/hooks';
import { AuthLoadingScreen } from './auth-loading-screen.component';

export const PublicRoute = () => {
    const { isAuthenticated, isInitializing, user } = useAppSelector((state) => state.auth);

    // Prevent flash of login screen while silent session restoration is running
    if (isInitializing) {
        return <AuthLoadingScreen />;
    }

    // If already authenticated, redirect to the user's current onboarding or platform destination
    if (isAuthenticated) {
        const isFullyOnboarded = user?.onboardingCompleted || user?.onboardingStep === 14;
        if (isFullyOnboarded) {
            return <Navigate to={user?.castingDirectorCompleted ? '/discovery' : '/profile-live'} replace />;
        }
        if (user?.kycCompleted) {
            return <Navigate to="/onboarding/profile" replace />;
        }
        return <Navigate to="/onboarding/kyc" replace />;
    }

    // Not authenticated, render the login/register forms
    return <Outlet />;
};
