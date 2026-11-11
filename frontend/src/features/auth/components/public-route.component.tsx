import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../../app/hooks";

export const PublicRoute = () => {
    const { isAuthenticated, isInitializing, user } = useAppSelector((state) => state.auth);

    // Prevent flash of login screen while silent session restoration is running
    if (isInitializing) {
        return null;
    }

    // If already authenticated, redirect to the appropriate onboarding or app step
    if (isAuthenticated) {
        if (user?.kycCompleted) {
            return <Navigate to='/onboarding/profile' replace />;
        }
        return <Navigate to='/onboarding/kyc' replace />;
    }

    // Not authenticated, render the login/register forms
    return <Outlet />;
};