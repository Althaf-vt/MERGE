import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { useRefreshMutation } from '../api/auth.api';
import { setCredentials, setInitialized } from '../slices/auth.slice';
import { Outlet } from 'react-router-dom';

export const SessionInitializer = () => {
    const [refresh] = useRefreshMutation();
    const dispatch = useAppDispatch();
    const { accessToken, isAuthenticated } = useAppSelector((state) => state.auth);
    const effectRan = useRef(false);

    useEffect(() => {
        // Prevent React 18 strict mode double-firing
        if (effectRan.current) return;

        const restoreSession = async () => {
            try {
                const response = await refresh().unwrap();
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
                // Downstream route guards will naturally handle the unauthenticated state.
            } finally {
                dispatch(setInitialized());
            }
        };

        if (!accessToken && !isAuthenticated) {
            restoreSession();
        } else {
            dispatch(setInitialized());
        }

        return () => {
            effectRan.current = true;
        };
    }, [accessToken, isAuthenticated, refresh, dispatch]);

    return <Outlet />;
};