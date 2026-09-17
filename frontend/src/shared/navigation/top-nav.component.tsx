import { Link, useNavigate } from 'react-router-dom';
import styles from './top-nav.module.css';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout } from '../../features/auth/slices/auth.slice';
import { authApi, useLogoutUserMutation } from '../../features/auth/api/auth.api';

export const TopNav = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    // Pull authentication state directly from Redux
    const { isAuthenticated, isInitializing } = useAppSelector((state) => state.auth);

    // Logout mutation hook
    const [logoutUser, { isLoading }] = useLogoutUserMutation();

    const handleLogout = async () => {
        try {
            await logoutUser().unwrap();
        } catch (error) {
            console.error('Logout failed on server:', error);
        } finally {
            dispatch(logout());
            dispatch(authApi.util.resetApiState());
            navigate('/login', { replace: true });
        }
    };

    return (
        <nav className={styles.navContainer}>
            {/* Left: Navigation Links */}
            <div className={styles.navLeft}>
                <span className={styles.navLink}>Features</span>
                <span className={styles.navLink}>Safety</span>
                <span className={styles.navLink}>Support</span>
            </div>

            {/* Center: Logo */}
            <div className={styles.logoContainer}>
                <Link to="/" className={styles.logo}>MERGE</Link>
            </div>

            {/* Right: Authentication Actions */}
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
                        <Link to="/login" className={styles.textBtn}>
                            Login
                        </Link>
                        <Link to="/register" className={styles.primaryBtn}>
                            Register
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};