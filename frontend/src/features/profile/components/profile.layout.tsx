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
                    {/* PROFILE GROUP */}
                    <div className={styles.navGroup}>
                        <span className={styles.groupLabel}>PROFILE</span>
                        <NavLink to="/profile/edit" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                            Edit Profile
                        </NavLink>
                        <NavLink to="/profile/photos" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                            Photos
                        </NavLink>
                    </div>

                    {/* MATCHING GROUP */}
                    <div className={styles.navGroup}>
                        <span className={styles.groupLabel}>MATCHING</span>
                        <NavLink to="/profile/preferences" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
                            Preferences
                        </NavLink>
                    </div>

                    {/* HEALTH & VERIFICATION GROUP */}
                    <div className={styles.navGroup}>
                        <span className={styles.groupLabel}>HEALTH & VERIFICATION</span>
                        <NavLink to="/profile/medical" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>
                            Medical Records
                        </NavLink>
                    </div>

                    {/* INSIGHTS GROUP */}
                    <div className={styles.navGroup}>
                        <span className={styles.groupLabel}>INSIGHTS</span>
                        <NavLink to="/profile/activity" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                            Activity
                        </NavLink>
                        <NavLink to="/profile/insights" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="4"></rect><path d="M7 16v-4"></path><path d="M12 16V8"></path><path d="M17 16v-6"></path></svg>
                            Profile Insights
                        </NavLink>
                        <NavLink to="/profile/analytics" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 14l5-5 4 4 6-6"></path><circle cx="17" cy="17" r="4"></circle><line x1="19.8" y1="19.8" x2="22" y2="22"></line></svg>
                            Advanced Analytics
                        </NavLink>
                    </div>

                    {/* PRIVACY & SAFETY GROUP */}
                    <div className={styles.navGroup}>
                        <span className={styles.groupLabel}>PRIVACY & SAFETY</span>
                        <NavLink to="/profile/privacy" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                            Privacy
                        </NavLink>
                        <NavLink to="/profile/security" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                            Security
                        </NavLink>
                        <NavLink to="/profile/blocked" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
                            Blocked Users
                        </NavLink>
                    </div>

                    {/* BILLING GROUP */}
                    <div className={styles.navGroup}>
                        <span className={styles.groupLabel}>BILLING</span>
                        <NavLink to="/profile/billing" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                            Subscription & Credits
                        </NavLink>
                    </div>

                    {/* COMING SOON GROUP (Bottom) */}
                    <div className={styles.navGroup} style={{ marginTop: 'auto', paddingTop: '1.5rem' }}>
                        <div className={styles.disabledLink}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                            Settings (Coming Soon)
                        </div>
                        <div className={styles.disabledLink}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                            Help (Coming Soon)
                        </div>
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