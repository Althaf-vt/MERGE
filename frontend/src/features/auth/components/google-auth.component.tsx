import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../../app/hooks';
import { useGoogleLoginMutation } from '../api/authApi';
import { setCredentials } from '../slices/authSlice';
import styles from './google-auth.module.css';

export const GoogleAuthButton: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [googleLogin, { isLoading }] = useGoogleLoginMutation();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSuccess = async (credentialResponse: any) => {
        setErrorMessage(null);
        const idToken = credentialResponse.credential;

        if (!idToken) {
            setErrorMessage('Failed to retrieve token from Google.');
            return;
        }

        try {
            const response = await googleLogin({ idToken }).unwrap();

            dispatch(
                setCredentials({
                    accessToken: response.accessToken,
                    user: response.user,
                })
            );

            // Redirect according to the user's progress
            if (response.user.onboardingCompleted) {
                navigate('/profile-live', { replace: true });
            } else {
                navigate('/onboarding/kyc', { replace: true });
            }
        } catch (err: any) {
            console.error('Google backend authentication error:', err);
            setErrorMessage(err?.data?.message || 'Google authentication failed.');
        }
    };

    return (
        <div className={styles.container}>
            {errorMessage && <p className={styles.errorText}>{errorMessage}</p>}
            <div className={styles.googleWrapper}>
                <GoogleLogin
                    onSuccess={handleSuccess}
                    onError={() => setErrorMessage('Google Sign-In failed or was closed.')}
                    theme="outline"
                    size="large"
                    shape="pill"
                    width="350"
                    text="continue_with"
                />
            </div>
            {isLoading && <p className={styles.loadingText}>Signing you in...</p>}
        </div>
    );
};