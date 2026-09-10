import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';

export const OnboardingGuard = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    
    // Check the final lock flag, or fallback to the final step number
    const isFullyOnboarded = user?.onboardingCompleted || user?.onboardingStep === 14; 

    if (isFullyOnboarded) {
        return <Navigate to="/profile-live" replace />;
    }

    return <Outlet />;
};