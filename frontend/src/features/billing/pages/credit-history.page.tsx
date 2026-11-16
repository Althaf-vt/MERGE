import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    useGetBillingHistoryQuery,
    useGetUserCreditBalanceQuery,
} from '../api/billing.api';
import { CreditHistoryTable } from '../components/history/credit-history-table.component';
import { BILLING_ROUTES } from '../constants/billing.constants';
import styles from './credit-history.module.css';

export const CreditHistoryPage: React.FC = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const limit = 10;

    const {
        data: historyResponse,
        isLoading: isHistoryLoading,
    } = useGetBillingHistoryQuery({ page, limit });

    const {
        data: balanceResponse,
        isLoading: isBalanceLoading,
    } = useGetUserCreditBalanceQuery();

    const creditBalance = balanceResponse?.data;
    const availableCredits = creditBalance?.balance ?? 0;
    const transactions = historyResponse?.data ?? [];

    // Calculate metrics from loaded transactions
    const totalPurchasedInView = transactions
        .filter((t) => t.type === 'CREDIT_PURCHASE' && t.status === 'COMPLETED')
        .reduce((sum, t) => sum + (t.creditsDelta || 0), 0);

    const totalUsedInView = transactions
        .filter((t) => t.type === 'CREDIT_SPENT' && t.status === 'COMPLETED')
        .reduce((sum, t) => sum + Math.abs(t.creditsDelta || 0), 0);

    const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return 'Never';
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
                <h2 className={styles.pageTitle}>Credit History & Ledger</h2>
                <p className={styles.pageSubtitle}>
                    Track your MERGE credit purchases, priority intro applications, and remaining balance.
                </p>
            </div>

            <div className={styles.overviewCard}>
                <div className={styles.overviewLeft}>
                    <div className={styles.balanceIcon}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
                            <path d="M12 18V6"></path>
                        </svg>
                    </div>
                    <div className={styles.balanceContent}>
                        <span className={styles.balanceLabel}>Available Balance</span>
                        <div className={styles.balanceValueRow}>
                            <span className={styles.balanceValue}>
                                {isBalanceLoading ? '...' : availableCredits}
                            </span>
                            <span className={styles.balanceUnit}>Credits</span>
                        </div>
                    </div>
                </div>

                <div className={styles.divider} />

                <div className={styles.metricsGroup}>
                    <div className={styles.metricItem}>
                        <span className={styles.metricLabel}>Recent Purchased</span>
                        <span className={`${styles.metricValue} ${styles.metricPositive}`}>
                            {isHistoryLoading ? '...' : `+${totalPurchasedInView} Credits`}
                        </span>
                    </div>

                    <div className={styles.metricItem}>
                        <span className={styles.metricLabel}>Recent Used</span>
                        <span className={`${styles.metricValue} ${styles.metricNegative}`}>
                            {isHistoryLoading ? '...' : `-${totalUsedInView} Credits`}
                        </span>
                    </div>

                    <div className={styles.metricItem}>
                        <span className={styles.metricLabel}>Last Updated</span>
                        <span className={styles.metricValue}>
                            {isBalanceLoading ? '...' : formatDate(creditBalance?.updatedAt)}
                        </span>
                    </div>

                    <div className={styles.metricItem}>
                        <span className={styles.metricLabel}>Status</span>
                        <span className={availableCredits > 0 ? styles.statusBadgeActive : styles.statusBadgeZero}>
                            {availableCredits > 0 ? 'Active' : 'Zero Balance'}
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    className={styles.buyCreditsButton}
                    onClick={() => navigate(BILLING_ROUTES.HUB)}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    <span>Buy Credits</span>
                </button>
            </div>

            <CreditHistoryTable
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
