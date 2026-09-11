import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { useRefreshMutation } from "../api/auth.api";
import { setCredentials, setInitialized } from "../slices/auth.slice";
import { Outlet } from "react-router-dom";

export const SessionInitializer = () => {
    const [refresh] = useRefreshMutation();
    const dispatch = useAppDispatch();
    const accessToken = useAppSelector((state) => state.auth.accessToken);
    const [, setChecked] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const restoreSession = async () => {
            try {
                const response = await refresh().unwrap();
                if (isMounted && response.accessToken) {
                    dispatch(setCredentials({ accessToken: response.accessToken, user: response.user }));
                }
            } catch {
                if (isMounted) {
                    dispatch(setInitialized());
                }
            } finally {
                if (isMounted) {
                    setChecked(true);
                }
            }
        };

        if (!accessToken) {
            restoreSession();
        } else {
            dispatch(setInitialized());
            setChecked(true);
        }

        return () => {
            isMounted = false;
        };
    }, [accessToken, refresh, dispatch]);

    return <Outlet />;
};