import { useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../../app/hooks';
import { useAdminRefreshMutation } from '../api/admin-auth.api';
import { setAdminCredentials, setAdminInitialized } from '../slices/admin-auth.slice';

export const AdminPersistLogin = () => {
    const dispatch = useAppDispatch();
    const { accessToken, isAuthenticated } = useAppSelector((state) => state.adminAuth);
    const [adminRefresh] = useAdminRefreshMutation();
    const effectRan = useRef(false);

    useEffect(() => {
        // Prevent React 18 strict mode double-firing
        if (effectRan.current) return;

        const verifyRefreshToken = async () => {
            try {
                const response = await adminRefresh().unwrap();
                if (response.data) {
                    dispatch(
                        setAdminCredentials({
                            accessToken: response.data.accessToken,
                            admin: response.data.admin,
                        })
                    );
                }
            } catch {
                // If it fails, the cookie is expired or missing.
                // The ProtectedRoute guard will naturally catch the unauthenticated state.
                console.error('Admin silent refresh failed. Token may be expired.');
            } finally {
                dispatch(setAdminInitialized());
            }
        };

        // If we don't have a token in memory but we haven't authenticated yet, try to refresh
        if (!accessToken && !isAuthenticated) {
            verifyRefreshToken();
        } else {
            dispatch(setAdminInitialized());
        }

        return () => {
            effectRan.current = true;
        };
    }, [accessToken, isAuthenticated, dispatch, adminRefresh]);

    return <Outlet />;
};