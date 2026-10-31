import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { ConnectionsTab } from '../types/connections.types';
import styles from './connections-empty-state.module.css';

export interface ConnectionsEmptyStateProps {
    tab: ConnectionsTab;
    customTitle?: string;
    customDescription?: string;
    onAction?: () => void;
}

export const ConnectionsEmptyState: React.FC<ConnectionsEmptyStateProps> = ({
    tab,
    customTitle,
    customDescription,
    onAction,
}) => {
    const navigate = useNavigate();

    const getEmptyContent = () => {
        if (customTitle && customDescription) {
            return {
                title: customTitle,
                description: customDescription,
                actionText: 'Explore Discovery',
                icon: 'compass',
            };
        }

        switch (tab) {
            case 'ACTIVE':
                return {
                    title: 'No Active Matches Yet',
                    description: 'When you and another member mutually connect, your ongoing matches will appear here to chat and connect.',
                    actionText: 'Discover People',
                    icon: 'heart',
                };
            case 'PENDING':
                return {
                    title: 'No Pending Requests',
                    description: 'You have no connection requests awaiting action. Browse your discovery feed to express interest or send priority intros.',
                    actionText: 'Browse Discovery Feed',
                    icon: 'inbox',
                };
            case 'SHORTLISTED':
                return {
                    title: 'Your Shortlist is Empty',
                    description: 'Save profiles you love while exploring the discovery feed to review them and send connection requests when you are ready.',
                    actionText: 'Explore New Profiles',
                    icon: 'bookmark',
                };
            case 'REVIEW_LATER':
                return {
                    title: 'No Profiles on Hold',
                    description: 'Profiles you put on hold while reviewing discovery will appear here so you never lose track of a potential spark.',
                    actionText: 'Open Discovery',
                    icon: 'clock',
                };
        }
    };

    const content = getEmptyContent();

    const handleAction = () => {
        if (onAction) {
            onAction();
        } else {
            navigate('/discovery');
        }
    };

    const renderIcon = () => {
        switch (content.icon) {
            case 'heart':
                return (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                );
            case 'inbox':
                return (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
                        <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
                    </svg>
                );
            case 'bookmark':
                return (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                    </svg>
                );
            case 'clock':
                return (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                );
            default:
                return (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                    </svg>
                );
        }
    };

    return (
        <div className={styles.emptyContainer} role="status">
            <div className={styles.iconCircle}>
                <div className={styles.pulseRing} />
                <div className={styles.iconContent}>{renderIcon()}</div>
            </div>

            <div className={styles.textWrapper}>
                <h3 className={styles.title}>{content.title}</h3>
                <p className={styles.description}>{content.description}</p>
            </div>

            <button type="button" onClick={handleAction} className={styles.actionButton}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                </svg>
                <span>{content.actionText}</span>
            </button>
        </div>
    );
};

