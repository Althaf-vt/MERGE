import { useState } from "react";
import { useAppDispatch } from "../../../app/hooks"
import { useLoginUserMutation } from "../api/authApi";
import { Link, useNavigate } from "react-router-dom";
import styles from './LoginForm.module.css';
import { setCredentials } from "../slices/authSlice";


export const LoginForm = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    // RTK Query hook
    const [login, {isLoading, error}] = useLoginUserMutation();

    // Form State
    const [email,setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [clientError, setClientError] = useState<string | null>(null);

    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setClientError(null);

        if(!email || !password){
            setClientError("Please fill in both fields.");
            return;
        }

        try {
            // 1. Call the backend API
            const response = await login({email,password}).unwrap();

            // 2. Save the tokens and user to the Redux store
            dispatch(setCredentials({
                accessToken: response.accessToken,
                refreshToken: response.refreshToken,
                user: response.user
            }))

            // 3. Redirect the user to the KYC onboarding screen
            navigate('/onboarding/kyc');
            
        } catch (error) {
            console.error("Login failed: ", error);
        }
        
    }

    // SVG Icons for the password toggle
    const EyeIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
        </svg>
    );

    const EyeOffIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>
    );

    return(
        <div className={styles.formWrapper}>

            <div className={styles.branding}>
                <h1 className={styles.title}>MERGE</h1>
                <p className={styles.subtitle}>Two Souls, One Journey.</p>
            </div>

            <form onSubmit={handleSubmit}>
                {clientError && <div style={{ color: '#ef4444', fontSize: '0.875rem', textAlign: 'center' }}>{clientError}</div>}
                {/* Error handling from NestJS backend */}
                {error && <div style={{ color: '#ef4444', fontSize: '0.875rem', textAlign: 'center' }}>Login failed. please check the credentials.</div>}
                
                <div className={styles.inputGroup}>
                    <input 
                        className={styles.input}
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email Address" 
                    />
                </div>
                <div className={styles.inputGroup}>
                    <input 
                        className={styles.input}
                        type={showPassword ? "text" : "password"} 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password" 
                    />
                    <span className={styles.icon} onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOffIcon/> : <EyeIcon/>}
                    </span>
                </div>

                <button type="submit" className={styles.primaryBtn} disabled={isLoading}>
                    {isLoading ? "Logging in...." : "Login"}
                </button>
            </form>

            <div className={styles.divider}>OR</div>
            
            {/* Google OAuth Button */}
            <button className={styles.googleBtn} type="button">
                <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
                </svg>
                Continue with Google
            </button>

            <p className={styles.footerText}>
                Dont have an account? <Link to="/register" className={styles.footerLink}>Register.</Link>
            </p>
        </div>
    )
}