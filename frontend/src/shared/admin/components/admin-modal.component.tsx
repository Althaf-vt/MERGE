import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import styles from './admin-modal.module.css';

export type AdminModalSize = 'sm' | 'md' | 'lg' | 'xl';

export interface AdminModalProps {
    isOpen?: boolean;
    onClose: () => void;
    title?: React.ReactNode;
    subtitle?: React.ReactNode;
    headerContent?: React.ReactNode;
    showCloseButton?: boolean;
    size?: AdminModalSize;
    maxWidth?: string;
    className?: string;
    contentClassName?: string;
    children: React.ReactNode;
}

export const AdminModal: React.FC<AdminModalProps> = ({
    isOpen = true,
    onClose,
    title,
    subtitle,
    headerContent,
    showCloseButton = true,
    size = 'md',
    maxWidth,
    className = '',
    contentClassName = '',
    children,
}) => {
    // Keyboard Escape dismiss
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Body scroll lock
    useEffect(() => {
        if (!isOpen) return;
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const sizeClass =
        size === 'sm'
            ? styles.sizeSm
            : size === 'lg'
              ? styles.sizeLg
              : size === 'xl'
                ? styles.sizeXl
                : styles.sizeMd;

    const hasHeader = Boolean(title || subtitle || headerContent || showCloseButton);

    return (
        <motion.div
            className={`${styles.overlay} ${className}`.trim()}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
        >
            <motion.div
                className={`${styles.modal} ${sizeClass} ${contentClassName}`.trim()}
                style={maxWidth ? { maxWidth } : undefined}
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, y: 18, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 18, scale: 0.97 }}
                transition={{ type: 'spring', visualDuration: 0.6, bounce: 0.12 }}
                role="dialog"
                aria-modal="true"
            >
                {hasHeader && (
                    <header className={styles.header}>
                        <div className={styles.titleWrapper}>
                            {typeof title === 'string' ? <h2 className={styles.title}>{title}</h2> : title}
                            {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
                            {headerContent}
                        </div>
                        {showCloseButton && (
                            <button
                                type="button"
                                onClick={onClose}
                                className={styles.closeBtn}
                                aria-label="Close modal"
                            >
                                &times;
                            </button>
                        )}
                    </header>
                )}
                {children}
            </motion.div>
        </motion.div>
    );
};

