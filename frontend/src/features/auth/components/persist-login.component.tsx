import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { authApi } from '../api/auth.api';
import { setCredentials, setInitialized } from '../slices/auth.slice';

// Module-level singleton promise: ensures that across all React 18 mounts,
// StrictMode remounts, and re-renders, exactly ONE refresh request is in flight.
let activeRefreshPromise: Promise<void> | null = null;

export const PersistLogin = () => {
    const dispatch = useAppDispatch();
    const { accessToken, isAuthenticated } = useAppSelector((state) => state.auth);

    useEffect(() => {
        // If already authenticated or token present, mark initialized and exit
        if (accessToken || isAuthenticated) {
            dispatch(setInitialized());
            return;
        }

        // If a refresh is already in-flight, do NOT fire a duplicate request
        if (activeRefreshPromise) {
            return;
        }

        activeRefreshPromise = (async () => {
            try {
                const response = await dispatch(
                    authApi.endpoints.refresh.initiate()
                ).unwrap();

                if (response.data?.accessToken) {
                    dispatch(
                        setCredentials({
                            accessToken: response.data.accessToken,
                            user: response.data.user,
                        })
                    );
                }
            } catch {
                // If it fails, cookie is missing or expired.
                // Downstream route guards (ProtectedRoute) will handle redirection.
            } finally {
                dispatch(setInitialized());
                activeRefreshPromise = null;
            }
        })();
    }, [accessToken, isAuthenticated, dispatch]);

    return <Outlet />;
};
