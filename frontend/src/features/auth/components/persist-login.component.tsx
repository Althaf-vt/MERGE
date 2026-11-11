import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../../app/hooks';

export const PersistLogin = () => {
    const { isAuthenticated, isInitializing } = useAppSelector((state) => state.auth);
    const location = useLocation();

    // While SessionInitializer is verifying the session, block child routes from mounting
    if (isInitializing) {
        return (
            <div
                style={{
                    display: 'flex',
                    height: '100vh',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'var(--text-muted, #71717a)',
                    fontSize: '14px',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
            >
                Restoring secure session...
            </div>
        );
    }

    // Once initialization finishes, if not authenticated, redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Authenticated, render protected child routes
    return <Outlet />;
};