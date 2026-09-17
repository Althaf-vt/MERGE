import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../../../../app/hooks"

export const AdminProtectedRoute = () => {
    const { isAuthenticated, isInitializing } = useAppSelector((state) => state.adminAuth);
    const location = useLocation();

    if (isInitializing) {
        return (
            <div style={{ display: 'flex', height: '100vh', backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center', color: '#71717a' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                    <line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                </svg>
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    return <Outlet />
}