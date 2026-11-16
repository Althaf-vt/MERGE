import React from 'react';
import type { UserSubscriptionDto } from '../../types/billing.types';
import { ENTITLEMENT_DETAILS, SUBSCRIPTION_STATUS_CONFIG } from '../../constants/billing.constants';
import styles from './subscription-status-card.module.css';

export interface SubscriptionStatusCardProps {
    subscription?: UserSubscriptionDto | null;
    planName?: string;
    isLoading?: boolean;
    onManageSubscription?: () => void;
    onUpgrade?: () => void;
}

export const SubscriptionStatusCard: React.FC<SubscriptionStatusCardProps> = ({
    subscription,
    planName,
    isLoading = false,
    onManageSubscription,
    onUpgrade,
}) => {
    if (isLoading) {
        return (
            <div className={styles.card}>
                <div className={styles.topRow}>
                    <div style={{ flex: 1 }}>
                        <div className={styles.skeleton} style={{ width: '40%', height: '2rem', marginBottom: '0.5rem' }} />
                        <div className={styles.skeleton} style={{ width: '60%', height: '1rem' }} />
                    </div>
                    <div className={styles.skeleton} style={{ width: '140px', height: '2.5rem' }} />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <div className={styles.skeleton} style={{ width: '100px', height: '1.75rem', borderRadius: '9999px' }} />
                    <div className={styles.skeleton} style={{ width: '120px', height: '1.75rem', borderRadius: '9999px' }} />
                    <div className={styles.skeleton} style={{ width: '90px', height: '1.75rem', borderRadius: '9999px' }} />
                </div>
            </div>
        );
    }

    const isActive = Boolean(subscription?.isActive);
    const statusKey = subscription?.status || 'INACTIVE';
    const statusMeta = SUBSCRIPTION_STATUS_CONFIG[statusKey] || SUBSCRIPTION_STATUS_CONFIG.INACTIVE;

    const formattedDate = subscription?.currentPeriodEnd
        ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
          })
        : null;

    const getBadgeClass = (variant: string) => {
        switch (variant) {
            case 'success':
                return styles.badgeSuccess;
            case 'warning':
                return styles.badgeWarning;
            case 'danger':
                return styles.badgeDanger;
            case 'info':
                return styles.badgeInfo;
            default:
                return styles.badgeMuted;
        }
    };

    const entitlements = subscription?.entitlements || [];

    return (
        <div className={styles.card}>
            <div className={styles.topRow}>
                <div>
                    <div className={styles.planHeader}>
                        <h2 className={styles.planTitle}>
                            {isActive ? (planName || 'PREMIUM') : 'FREE MEMBERSHIP'}
                        </h2>
                        <span className={`${styles.badge} ${getBadgeClass(statusMeta.variant)}`}>
                            {statusMeta.label}
                        </span>
                    </div>

                    <p className={styles.renewalText}>
                        {isActive
                            ? subscription?.autoRenew
                                ? `Renews on ${formattedDate}`
                                : `Auto-renewal paused • Access until ${formattedDate}`
                            : 'Upgrade to unlock Scene Partner simulations, 5 daily recommendations, and deep filters.'}
                    </p>
                </div>

                {isActive ? (
                    <button
                        type="button"
                        className={styles.actionButton}
                        onClick={onManageSubscription}
                    >
                        Manage Subscription
                    </button>
                ) : (
                    <button
                        type="button"
                        className={styles.actionButton}
                        onClick={onUpgrade}
                    >
                        Upgrade to Premium
                    </button>
                )}
            </div>

            {entitlements.length > 0 && (
                <div className={styles.entitlementsList}>
                    {entitlements.map((ent) => {
                        const detail = ENTITLEMENT_DETAILS[ent];
                        const label = detail ? detail.title : ent;
                        return (
                            <span key={ent} className={styles.entitlementPill}>
                                <span className={styles.pillIcon}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </span>
                                {label}
                            </span>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
