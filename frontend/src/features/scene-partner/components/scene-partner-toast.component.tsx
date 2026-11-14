import React, { useEffect, useState } from 'react';
import { toast, type ToastMessage } from '../../../shared/utils/toast.util';
import styles from './scene-partner-toast.module.css';

export const ScenePartnerToastContainer: React.FC = () => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    useEffect(() => {
        const unsubscribe = toast.subscribe((updated) => {
            setToasts(updated);
        });
        return unsubscribe;
    }, []);

    if (toasts.length === 0) {
        return null;
    }

    return (
        <div className={styles.toastContainer} aria-live="assertive">
            {toasts.map((item) => (
                <div
                    key={item.id}
                    className={`${styles.toastCard} ${
                        item.type === 'error'
                            ? styles.toastError
                            : item.type === 'success'
                            ? styles.toastSuccess
                            : item.type === 'warning'
                            ? styles.toastWarning
                            : styles.toastInfo
                    }`}
                    role={item.type === 'error' ? 'alert' : 'status'}
                >
                    <div className={styles.contentWrapper}>
                        <div className={styles.iconWrapper} aria-hidden="true">
                            {item.type === 'error' && (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                            )}
                            {item.type === 'success' && (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                            )}
                            {item.type === 'warning' && (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                                    <line x1="12" y1="9" x2="12" y2="13"></line>
                                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                </svg>
                            )}
                            {item.type === 'info' && (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="16" x2="12" y2="12"></line>
                                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                </svg>
                            )}
                        </div>
                        <p className={styles.message}>{item.message}</p>
                    </div>

                    <button
                        type="button"
                        className={styles.closeButton}
                        onClick={() => toast.dismiss(item.id)}
                        aria-label="Dismiss notification"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            ))}
        </div>
    );
};

