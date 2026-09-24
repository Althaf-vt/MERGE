import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../../app/hooks';
import { useAdminLogoutMutation } from '../../auth/api/admin-auth.api';
import { adminLogout } from '../../auth/slices/admin-auth.slice';
import styles from './admin.layout.module.css';
import LogoIcon from '../../../../assets/logos/merge-logo-icon.svg';
import '../../../../shared/admin/styles/admin-global.css';
import { ADMIN_PERMISSIONS } from '../../management/types/admin-management.types';

type Theme = 'dark' | 'light';

export const AdminLayout: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { admin } = useAppSelector((state) => state.adminAuth);
    const [logoutApi] = useAdminLogoutMutation();

    // Theme State Initialization
    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem('merge-admin-theme');
        if (saved === 'dark' || saved === 'light') return saved;
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    });

    // Apply theme to localStorage
    useEffect(() => {
        localStorage.setItem('merge-admin-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const handleLogout = async () => {
        try {
            await logoutApi().unwrap();
        } catch (error) {
            console.error('Logout API failed, forcing local logout', error);
        } finally {
            dispatch(adminLogout());
            navigate('/admin/login', { replace: true });
        }
    };

    const hasPermission = (permission: string) => {
        if (admin?.role === 'SUPER_ADMIN') return true;
        return admin?.permissions?.includes(permission);
    };

    return (
        <div className={`${styles.layoutContainer} admin-portal-root`} data-theme={theme}>
            {/* Sidebar Navigation */}
            <aside className={styles.sidebar}>
                <div className={styles.brand}>
                    <img src={LogoIcon} alt="MERGE" className={styles.logoSquare} />
                    <span className={styles.brandTitle}>MERGE ADMIN</span>
                </div>

                <nav className={styles.navMenu}>
                    {/* Dashboard is universally accessible */}
                    <NavLink to="/admin/dashboard" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                        Dashboard
                    </NavLink>

                    {hasPermission(ADMIN_PERMISSIONS.USERS_VIEW) && (
                        <NavLink to="/admin/users" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            User Management
                        </NavLink>
                    )}

                    {admin?.role === 'SUPER_ADMIN' && (
                        <NavLink to="/admin/management" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15a7 7 0 0 0 7-7V4l-7-2-7 2v4a7 7 0 0 0 7 7z"></path><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"></path></svg>
                            Admin Personnel
                        </NavLink>
                    )}

                    {hasPermission(ADMIN_PERMISSIONS.KYC_VIEW) && (
                        <NavLink to="/admin/kyc-escalations" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                            KYC Escalations
                        </NavLink>
                    )}

                    {hasPermission(ADMIN_PERMISSIONS.USERS_VIEW) && (
                        <NavLink to="/admin/moderation" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                            Sentinel Moderation
                        </NavLink>
                    )}

                    {hasPermission(ADMIN_PERMISSIONS.SETTINGS_VIEW) && (
                        <NavLink to="/admin/settings" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                            System Settings
                        </NavLink>
                    )}
                </nav>

                <div className={styles.sidebarFooter}>
                    <button className={styles.logoutBtn} onClick={handleLogout}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className={styles.mainContent}>
                <header className={styles.topHeader}>
                    <div className={styles.headerLeft}>
                        <span className={styles.workspaceText}>Workspace Control</span>
                    </div>
                    <div className={styles.headerRight}>
                        <button className={styles.themeToggle} onClick={toggleTheme} aria-label="Toggle theme">
                            {theme === 'dark' ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="19.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                            )}
                        </button>
                        
                        <div className={styles.adminProfile}>
                            <div className={styles.adminInfo}>
                                <span className={styles.adminName}>{admin?.fullName || 'Administrator'}</span>
                                <span className={styles.adminRole}>{admin?.role?.replace('_', ' ') || 'Admin'}</span>
                            </div>
                            <div className={styles.avatar}>
                                {admin?.fullName?.charAt(0).toUpperCase() || 'A'}
                            </div>
                        </div>
                    </div>
                </header>

                <div className={styles.contentScroll}>
                    <Outlet /> 
                </div>
            </main>
        </div>
    );
};