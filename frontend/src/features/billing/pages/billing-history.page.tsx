import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    useGetBillingHistoryQuery,
    useGetUserSubscriptionQuery,
    useGetPlansQuery,
} from '../api/billing.api';
import { BillingHistoryTable } from '../components/history/billing-history-table.component';
import { BILLING_ROUTES } from '../constants/billing.constants';
import styles from './billing-history.module.css';

export const BillingHistoryPage: React.FC = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const limit = 10;

    const {
        data: historyResponse,
        isLoading: isHistoryLoading,
    } = useGetBillingHistoryQuery({ page, limit });

    const {
        data: subscriptionResponse,
        isLoading: isSubscriptionLoading,
    } = useGetUserSubscriptionQuery();

    const {
        data: plansResponse,
    } = useGetPlansQuery();

    const subscription = subscriptionResponse?.data ?? null;
    const plans = plansResponse?.data ?? [];
    const activePlan = plans.find((p) => p.id === subscription?.planId);

    const isSubscriptionActive = subscription?.status === 'ACTIVE';
    const planName = isSubscriptionActive
        ? (activePlan?.name ? `${activePlan.name} Membership` : 'Premium Membership')
        : 'Free Tier';

    const formatBannerDate = (dateStr?: string) => {
        if (!dateStr) return '';
        try {
            return new Date(dateStr).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    const nextBillingText = isSubscriptionActive && subscription?.currentPeriodEnd
        ? subscription.autoRenew
            ? `Next billing date: ${formatBannerDate(subscription.currentPeriodEnd)}`
            : `Access expires on: ${formatBannerDate(subscription.currentPeriodEnd)}`
        : 'Upgrade to MERGE Premium to unlock priority matching and AI features.';

    return (
        <div className={styles.pageContainer}>
            <button
                type="button"
                className={styles.backButton}
                onClick={() => navigate(BILLING_ROUTES.HUB)}
                aria-label="Back to Subscription & Credits"
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                <span>Subscription & Credits</span>
            </button>

            <div className={styles.pageHeader}>
                <h2 className={styles.pageTitle}>Billing & Invoices</h2>
                <p className={styles.pageSubtitle}>
                    Review your past subscription and credit pack transactions, payment receipts, and billing history.
                </p>
            </div>

            <div className={styles.summaryBanner}>
                <div className={styles.summaryLeft}>
                    <div className={styles.planIconContainer}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                            <line x1="2" y1="10" x2="22" y2="10"></line>
                        </svg>
                    </div>
                    <div className={styles.summaryDetails}>
                        <div className={styles.planHeaderRow}>
                            <h3 className={styles.planTitle}>{isSubscriptionLoading ? 'Loading membership...' : planName}</h3>
                            <span className={isSubscriptionActive ? styles.activeBadge : styles.inactiveBadge}>
                                {isSubscriptionActive ? 'Active' : 'Free'}
                            </span>
                        </div>
                        <p className={styles.summaryDate}>{nextBillingText}</p>
                    </div>
                </div>

                <button
                    type="button"
                    className={styles.manageButton}
                    onClick={() => navigate(isSubscriptionActive ? BILLING_ROUTES.MANAGE : BILLING_ROUTES.HUB)}
                >
                    <span>{isSubscriptionActive ? 'Manage Subscription' : 'Upgrade Plan'}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </button>
            </div>

            <BillingHistoryTable
                transactions={historyResponse?.data ?? []}
                total={historyResponse?.meta?.total ?? 0}
                page={page}
                limit={limit}
                isLoading={isHistoryLoading}
                onPageChange={(newPage) => setPage(newPage)}
            />
        </div>
    );
};
