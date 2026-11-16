import React from 'react';
import type { UserSubscriptionDto } from '../../types/billing.types';
import { ENTITLEMENT_DETAILS, SUBSCRIPTION_STATUS_CONFIG } from '../../constants/billing.constants';
import styles from './manage-subscription-card.module.css';

export interface ManageSubscriptionCardProps {
    subscription?: UserSubscriptionDto | null;
    planName?: string;
    planPriceFormatted?: string;
    billingPeriodLabel?: string;
    isLoading?: boolean;
    isUpdatingAutoRenew?: boolean;
    onToggleAutoRenew: (autoRenew: boolean) => void;
    onViewBillingHistory: () => void;
    onCancelSubscription: () => void;
    onUpgrade?: () => void;
}

export const ManageSubscriptionCard: React.FC<ManageSubscriptionCardProps> = ({
    subscription,
    planName = 'PREMIUM',
    planPriceFormatted = '₹999 / month',
    billingPeriodLabel = 'Monthly Billing',
    isLoading = false,
    isUpdatingAutoRenew = false,
    onToggleAutoRenew,
    onViewBillingHistory,
    onCancelSubscription,
    onUpgrade,
}) => {
    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.sectionCard}>
                    <div className={styles.skeleton} style={{ width: '180px', height: '1.5rem', marginBottom: '1rem' }} />
                    <div className={styles.skeleton} style={{ width: '100%', height: '3.5rem', marginBottom: '1rem' }} />
                    <div className={styles.skeleton} style={{ width: '100%', height: '4rem' }} />
                </div>
                <div className={styles.sectionCard}>
                    <div className={styles.skeleton} style={{ width: '150px', height: '1.25rem', marginBottom: '0.75rem' }} />
                    <div className={styles.skeleton} style={{ width: '100%', height: '2.5rem' }} />
                </div>
            </div>
        );
    }

    const isActive = Boolean(subscription?.isActive);
    const statusKey = subscription?.status || 'INACTIVE';
    const statusMeta = SUBSCRIPTION_STATUS_CONFIG[statusKey] || SUBSCRIPTION_STATUS_CONFIG.INACTIVE;
    const autoRenew = Boolean(subscription?.autoRenew);

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
            default:
                return styles.badgeMuted;
        }
    };

    const entitlements = subscription?.entitlements || [];

    return (
        <div className={styles.container}>
            {/* Section 1: Current Subscription */}
            <div className={styles.sectionCard}>
                <h3 className={styles.sectionTitle}>Current Subscription</h3>

                <div className={styles.planHeader}>
                    <div className={styles.planInfoLeft}>
                        <div className={styles.planIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                        </div>
                        <div>
                            <h4 className={styles.planName}>{isActive ? planName : 'Free Membership'}</h4>
                            <p className={styles.planSubtext}>
                                {isActive ? `MERGE Premium • ${billingPeriodLabel}` : 'Basic Membership Tier'}
                            </p>
                        </div>
                    </div>

                    <span className={`${styles.badge} ${getBadgeClass(statusMeta.variant)}`}>
                        {statusMeta.label}
                    </span>
                </div>

                <div className={styles.detailsGrid}>
                    <div className={styles.detailCol}>
                        <span className={styles.detailLabel}>Plan Cost</span>
                        <span className={styles.detailValue}>
                            {isActive ? planPriceFormatted : '₹0 / month'}
                        </span>
                    </div>

                    <div className={styles.detailCol}>
                        <span className={styles.detailLabel}>
                            {autoRenew ? 'Next Renewal' : 'Access Ends'}
                        </span>
                        <span className={styles.detailValue}>
                            {formattedDate || '—'}
                        </span>
                    </div>
                </div>

                {entitlements.length > 0 && (
                    <div className={styles.entitlementsList}>
                        {entitlements.map((ent) => {
                            const detail = ENTITLEMENT_DETAILS[ent];
                            const label = detail ? detail.title : ent;
                            return (
                                <span key={ent} className={styles.entitlementPill}>
                                    <span className={styles.pillIcon}>
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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

            {/* Section 2: Billing & Renewal */}
            <div className={styles.sectionCard}>
                <h3 className={styles.sectionTitle}>Billing & Renewal</h3>

                <div className={styles.toggleRow}>
                    <div className={styles.toggleTextLeft}>
                        <span className={styles.toggleLabel}>Auto-Renewal</span>
                        <span className={styles.toggleSubtext}>
                            {isActive
                                ? autoRenew
                                    ? `Your subscription will automatically renew on ${formattedDate}.`
                                    : `Auto-renewal is paused. Your access remains active until ${formattedDate}.`
                                : 'Subscribe to a premium plan to enable recurring membership benefits.'}
                        </span>
                    </div>

                    <label className={styles.switch}>
                        <input
                            type="checkbox"
                            className={styles.switchInput}
                            checked={autoRenew}
                            onChange={(e) => onToggleAutoRenew(e.target.checked)}
                            disabled={isUpdatingAutoRenew || !isActive}
                            aria-label="Toggle auto-renewal"
                        />
                        <span className={styles.slider} />
                    </label>
                </div>
            </div>

            {/* Section 3: Subscription Actions */}
            <div className={styles.sectionCard}>
                <h3 className={styles.sectionTitle}>Subscription Actions</h3>
                <p className={styles.actionsSubtext}>
                    {isActive
                        ? 'If you cancel, your Premium benefits will remain available until the end of your current billing period.'
                        : 'Upgrade anytime to activate Scene Partner rehearsal sessions and premium discovery benefits.'}
                </p>

                <div className={styles.actionsRow}>
                    <button
                        type="button"
                        className={styles.historyButton}
                        onClick={onViewBillingHistory}
                    >
                        View Billing History
                    </button>

                    {isActive ? (
                        autoRenew ? (
                            <button
                                type="button"
                                className={styles.cancelButton}
                                onClick={onCancelSubscription}
                            >
                                Cancel Subscription
                            </button>
                        ) : (
                            <button
                                type="button"
                                className={styles.upgradeButton}
                                onClick={() => onToggleAutoRenew(true)}
                                disabled={isUpdatingAutoRenew}
                            >
                                Reactivate Auto-Renewal
                            </button>
                        )
                    ) : (
                        <button
                            type="button"
                            className={styles.upgradeButton}
                            onClick={onUpgrade}
                        >
                            Upgrade to Premium
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
