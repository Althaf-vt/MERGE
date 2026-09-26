import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { logout } from '../../auth/slices/auth.slice';
import { useGetProfileQuery } from '../api/profile.api';
import styles from './profile.layout.module.css';

export const ProfileLayout: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { user } = useAppSelector((state) => state.auth);

    // Fetch fresh profile data including presigned photo URLs
    const { data: profileResponse } = useGetProfileQuery();
    const liveProfile = profileResponse?.data?.profile || user?.profile;
    const photos = profileResponse?.data?.photos || user?.photos || [];

    // Fallback if image fails to load via network/CORS
    const [imageError, setImageError] = useState(false);

    // Primary photo must be explicitly APPROVED and marked as primary
    const primaryPhoto = photos.find((p) => p.isPrimary && p.status === 'APPROVED');

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const displayName = liveProfile?.displayName || 'User';
    const fallbackInitial = displayName.trim().charAt(0).toUpperCase() || 'U';

    const locationDisplay = liveProfile?.city
        ? `${liveProfile.city}${liveProfile.state ? `, ${liveProfile.state}` : ''}`
        : 'Location hidden';

    return (
        <div className={styles.layoutContainer}>
            <aside className={styles.sidebar}>
                <div className={styles.userInfo}>
                    <div className={styles.avatar}>
                        {primaryPhoto?.url && !imageError ? (
                            <img
                                src={primaryPhoto.url}
                                alt={displayName}
                                className={styles.avatarImg}
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <span className={styles.avatarInitial}>{fallbackInitial}</span>
                        )}
                    </div>
                    <h3 className={styles.userName}>{displayName}</h3>
                    <p className={styles.userLocation}>{locationDisplay}</p>
                </div>

                <nav className={styles.navigation}>
                    <div className={styles.navGroup}>
                        <span className={styles.groupLabel}>PROFILE</span>
                        <NavLink to="/profile/edit" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                            Edit Profile
                        </NavLink>
                        <NavLink to="/profile/photos" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                            Photos
                        </NavLink>
                    </div>

                    <div className={styles.navGroup}>
                        <span className={styles.groupLabel}>MATCHING</span>
                        <NavLink to="/profile/preferences" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                            Preferences
                        </NavLink>
                    </div>

                    <div className={styles.navGroup}>
                        <span className={styles.groupLabel}>HEALTH & VERIFICATION</span>
                        <NavLink to="/profile/medical" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                            Medical Records
                        </NavLink>
                    </div>

                    <div className={styles.navGroup}>
                        <span className={styles.groupLabel}>PRIVACY & SAFETY</span>
                        <NavLink to="/profile/privacy" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                            Privacy
                        </NavLink>
                        <NavLink to="/profile/security" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                            Security
                        </NavLink>
                        <NavLink to="/profile/blocked" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                            Blocked Users
                        </NavLink>
                    </div>

                    <div className={styles.navGroup}>
                        <span className={styles.groupLabel}>BILLING</span>
                        <NavLink to="/profile/billing" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                            Subscription & Credits
                        </NavLink>
                    </div>
                </nav>

                <div className={styles.logoutWrapper}>
                    <button className={styles.logoutBtn} onClick={handleLogout}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        Logout
                    </button>
                </div>
            </aside>

            <main className={styles.contentArea}>
                <div className={styles.contentWrapper}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};