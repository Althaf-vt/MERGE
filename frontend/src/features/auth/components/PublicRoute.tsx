import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../../app/hooks"

export const PublicRoute = () => {
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
    const user = useAppSelector((state) => state.auth.user);

    // If already authenticated, redirect to the appropriate onboarding ro app step
    if(isAuthenticated){
        if(user?.kycCompleted){
            return <Navigate to='/onboarding/profile' replace/>;
        }
        return <Navigate to='/onboarding/kyc' replace/>
    }

    // Not authenticated, render the login/register forms
    return <Outlet/>
}