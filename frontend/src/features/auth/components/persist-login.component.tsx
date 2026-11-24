import { useEffect, useRef } from 'react';
import { useStore } from 'react-redux';
import { Outlet } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import type { RootState } from '../../../app/store';
import { refreshAuthSession } from '../../../shared/api/base-api';
import { setInitialized } from '../slices/auth.slice';

export const PersistLogin = () => {
    const dispatch = useAppDispatch();
    const store = useStore<RootState>();
    const { accessToken, isAuthenticated, isInitializing } = useAppSelector((state) => state.auth);
    const effectRan = useRef(false);

    useEffect(() => {
        // Restore session strictly once during initial app boot; never re-fire on logout().
        if (effectRan.current || !isInitializing) return;
        effectRan.current = true;

        if (accessToken || isAuthenticated) {
            dispatch(setInitialized());
            return;
        }

        const restoreSession = async () => {
            try {
                await refreshAuthSession(dispatch, store.getState);
            } finally {
                dispatch(setInitialized());
            }
        };

        restoreSession();
    }, [accessToken, isAuthenticated, isInitializing, dispatch, store]);

    return <Outlet />;
};
