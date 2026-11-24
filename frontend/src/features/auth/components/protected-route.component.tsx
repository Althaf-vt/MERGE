import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../../app/hooks';
import { AuthLoadingScreen } from './auth-loading-screen.component';

export const ProtectedRoute = () => {
    const { isAuthenticated, isInitializing } = useAppSelector((state) => state.auth);
    const location = useLocation();

    // Prevent mounting child routes and queries while session is initializing
    if (isInitializing) {
        return <AuthLoadingScreen />;
    }

    // Gated from unauthenticated users: preserve attempted route in state
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
};
