import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { useRefreshMutation } from "../api/authApi";
import { setCredentials } from "../slices/authSlice";
import { Navigate, Outlet } from "react-router-dom";

export const PersistLogin = () => {
    const [refresh, {isLoading, isUninitialized}] = useRefreshMutation();
    const dispatch = useAppDispatch();
    const accessToken = useAppSelector((state) => state.auth.accessToken);
    const [hasAttempted, setHasAttempted] = useState(false);

    useEffect(() => {
        const verifyRefreshToken = async () => {
            try {
                // Silently hit the backend /refresh endpoint
                const response = await refresh().unwrap();

                if(!response.accessToken){
                    throw new Error("No access token found in the refresh payload.");
                }

                // Save the fresh token and latesh user data to Redux
                dispatch(setCredentials({accessToken: response.accessToken, user: response.user}));
            } catch (error) {
                console.error('Silent refresh failed. User must log in manually');
            } finally{
                setHasAttempted(true);
            }
        }

        // Only attempt the refresh if we don't currently have a token in memory
        if(!accessToken){
            verifyRefreshToken();
        }else{
            setHasAttempted(true);
        }
    }, [accessToken, refresh, dispatch])

    if(isLoading || (!hasAttempted && isUninitialized)){
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Restoring secure session...</div>;    
    }

    // If we attempted a refresh and still have no token, kick then to login
    if(!accessToken){
        return <Navigate to={'/login'} replace/>
    }

    // Otherwise, render the protected child routes
    return <Outlet/>
}