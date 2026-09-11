import { Link, useNavigate } from 'react-router-dom';
import styles from './top-nav.module.css';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout } from '../../features/auth/slices/authSlice';
import { authApi, useLogoutUserMutation } from '../../features/auth/api/authApi';

export const TopNav = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    // Pull authentication state directly from Redux
    const { isAuthenticated, isInitializing } = useAppSelector((state) => state.auth);

    // Logout mutation hook
    const [logoutUser, { isLoading }] = useLogoutUserMutation();

    const handleLogout = async () => {
        try {
            // 1. Tell backend to clear the HttpOnly refreshToken cookie
            await logoutUser().unwrap();
        } catch (error) {
            console.error('Logout failed on server:', error);
        } finally {
            // 2. Clear client Redux auth state
            dispatch(logout());

            // 3. Clear all cached RTK Query state in memory
            dispatch(authApi.util.resetApiState());

            // 4. Redirect to login page
            navigate('/login', { replace: true });
        }
    };

    return (
        <nav className={styles.navContainer}>
            <div>
                <Link to="/" className={styles.logo}>MERGE</Link>
            </div>

            <div className={styles.navLinks}>
                <span className={styles.navLink}>Features</span>
                <span className={styles.navLink}>Safety</span>
            </div>

           <div className={styles.authAction}>
                {isInitializing ? (
                    <div style={{ minWidth: '80px', height: '36px' }} />
                ) : isAuthenticated ? (
                    <button 
                        onClick={handleLogout} 
                        className={styles.logoutBtn}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Logging out...' : 'Logout'}
                    </button>
                ) : (
                    <>
                        <Link to="/login" className={styles.loginBtn}>
                            Login
                        </Link>
                        <Link to="/register" className={styles.loginBtn}>
                            Register
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};