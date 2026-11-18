import React from 'react';
import type {
    SubscriptionPlanDto,
    CreditPackDto,
    AdminBillingTransactionDto,
} from '../../types/admin-billing.types';
import { type AdminBillingTab, ADMIN_BILLING_TABS } from '../../constants/admin-billing.constants';
import { getOffersSummary } from '../../utils/admin-billing-offers.util';
import { MetricCard } from '../shared/metric-card.component';
import {
    BillingBadge,
    PaymentEnvironmentBadge,
    PlanStatusBadge,
    TransactionStatusBadge,
    TransactionTypeBadge,
} from '../shared/billing-badge.component';
import styles from './billing-overview-tab.module.css';

export interface BillingOverviewTabProps {
    plans: SubscriptionPlanDto[];
    creditPacks: CreditPackDto[];
    transactions: AdminBillingTransactionDto[];
    totalTransactions: number;
    isLoading?: boolean;
    onNavigateTab: (tab: AdminBillingTab) => void;
    onOpenCreatePlan: () => void;
    onOpenCreateCreditPack: () => void;
    onSelectTransaction?: (transaction: AdminBillingTransactionDto) => void;
}

export const BillingOverviewTab: React.FC<BillingOverviewTabProps> = ({
    plans,
    creditPacks,
    transactions,
    totalTransactions,
    isLoading = false,
    onNavigateTab,
    onOpenCreatePlan,
    onOpenCreateCreditPack,
    onSelectTransaction,
}) => {
    // 1. Calculate Gross Platform Volume from completed transactions
    const completedTransactions = transactions.filter((t) => t.status === 'COMPLETED');
    const totalGrossRevenue = completedTransactions.reduce(
        (sum, t) => sum + (t.amount?.amount ?? 0),
        0
    );
    const grossVolumeFormatted = `₹${totalGrossRevenue.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

    // 2. Subscription Revenue vs Priority Credit Revenue
    const subscriptionTransactions = completedTransactions.filter(
        (t) => t.type === 'SUBSCRIPTION_PURCHASE' || t.type === 'SUBSCRIPTION_RENEWAL'
    );
    const subRevenueAmount = subscriptionTransactions.reduce(
        (sum, t) => sum + (t.amount?.amount ?? 0),
        0
    );
    const subSharePercent =
        totalGrossRevenue > 0 ? ((subRevenueAmount / totalGrossRevenue) * 100).toFixed(1) : '0.0';

    const creditTransactions = completedTransactions.filter((t) => t.type === 'CREDIT_PURCHASE');
    const creditRevenueAmount = creditTransactions.reduce(
        (sum, t) => sum + (t.amount?.amount ?? 0),
        0
    );
    const creditSharePercent =
        totalGrossRevenue > 0 ? ((creditRevenueAmount / totalGrossRevenue) * 100).toFixed(1) : '0.0';

    // 3. Success rate calculation
    const sampledTotal = transactions.length;
    const successRate =
        sampledTotal > 0
            ? ((completedTransactions.length / sampledTotal) * 100).toFixed(1)
            : '100.0';

    // 4. Catalog summary counts
    const activePlansCount = plans.filter((p) => p.isActive).length;
    const activeCreditPacksCount = creditPacks.filter((c) => c.isActive).length;
    const listedPacksCount = creditPacks.filter((c) => c.isListed).length;

    // 5. Recent 5 transactions
    const recentTransactions = transactions.slice(0, 5);

    return (
        <div className={styles.container}>
            {/* Top Operational KPI Metrics */}
            <section className={styles.metricsGrid}>
                <MetricCard
                    title="Gross Platform Volume"
                    value={grossVolumeFormatted}
                    subtitle="Lifetime completed transactions"
                    isLoading={isLoading}
                    icon={
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="1" x2="12" y2="23"></line>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                    }
                />

                <MetricCard
                    title="Subscription Share"
                    value={`${subSharePercent}%`}
                    subtitle={`₹${subRevenueAmount.toLocaleString('en-IN')} revenue`}
                    isLoading={isLoading}
                    trend={{
                        value: `${subscriptionTransactions.length} txns`,
                        direction: 'neutral',
                    }}
                    icon={
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                        </svg>
                    }
                />

                <MetricCard
                    title="Priority Credits Share"
                    value={`${creditSharePercent}%`}
                    subtitle={`₹${creditRevenueAmount.toLocaleString('en-IN')} revenue`}
                    isLoading={isLoading}
                    trend={{
                        value: `${creditTransactions.length} txns`,
                        direction: 'neutral',
                    }}
                    icon={
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                        </svg>
                    }
                />

                <MetricCard
                    title="Total Transactions"
                    value={totalTransactions}
                    subtitle={`${completedTransactions.length} settled · ${transactions.length - completedTransactions.length} other`}
                    isLoading={isLoading}
                    onClick={() => onNavigateTab(ADMIN_BILLING_TABS.HISTORY)}
                    icon={
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                        </svg>
                    }
                />

                <MetricCard
                    title="Success Rate"
                    value={`${successRate}%`}
                    subtitle="Payment gateway fulfillment rate"
                    isLoading={isLoading}
                    trend={{
                        value: `${completedTransactions.length}/${sampledTotal}`,
                        direction: Number(successRate) >= 90 ? 'up' : 'down',
                        isPositive: Number(successRate) >= 90,
                    }}
                    icon={
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                    }
                />

                <MetricCard
                    title="Active Commercial Catalog"
                    value={`${activePlansCount + activeCreditPacksCount}`}
                    subtitle={`${activePlansCount} plans · ${activeCreditPacksCount} packs (${listedPacksCount} listed)`}
                    isLoading={isLoading}
                    onClick={() => onNavigateTab(ADMIN_BILLING_TABS.PLANS)}
                    icon={
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                            <line x1="8" y1="21" x2="16" y2="21"></line>
                            <line x1="12" y1="17" x2="12" y2="21"></line>
                        </svg>
                    }
                />
            </section>

            {/* Quick Breakdown Two-Column Section */}
            <div className={styles.breakdownGrid}>
                {/* Left Column: Commercial Plans & Credit Inventory */}
                <div className={styles.catalogColumn}>
                    {/* Subscription Plans Snapshot */}
                    <div className={styles.sectionCard}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardHeaderTitle}>
                                <h3 className={styles.cardTitle}>SUBSCRIPTION TIERS</h3>
                                <span className={styles.badgeCount}>{plans.length} tiers</span>
                            </div>
                            <div className={styles.cardActions}>
                                <button
                                    type="button"
                                    className={styles.actionBtnSecondary}
                                    onClick={() => onNavigateTab(ADMIN_BILLING_TABS.PLANS)}
                                >
                                    Manage Plans &rarr;
                                </button>
                                <button
                                    type="button"
                                    className={styles.actionBtnPrimary}
                                    onClick={onOpenCreatePlan}
                                >
                                    + New Plan
                                </button>
                            </div>
                        </div>

                        <div className={styles.itemList}>
                            {plans.slice(0, 4).map((plan) => (
                                <div key={plan.id} className={styles.itemRow}>
                                    <div className={styles.itemMain}>
                                        <div className={styles.itemNameRow}>
                                            <span className={styles.itemName}>{plan.name}</span>
                                            <span className={styles.itemSlug}>({plan.code})</span>
                                        </div>
                                        <div className={styles.itemMeta}>
                                            <span className={styles.periodPill}>{plan.billingPeriod}</span>
                                            <span>•</span>
                                            <span>{plan.entitlements.length} entitlements</span>
                                            {plan.offers.length > 0 && (
                                                <>
                                                    <span>•</span>
                                                    <span className={styles.offersTag}>
                                                        {getOffersSummary(plan.offers).activeCount} active offers
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className={styles.itemAside}>
                                        {plan.effectivePrice && plan.effectivePrice.amount < plan.price.amount ? (
                                            <div className={styles.priceContainer}>
                                                <span className={styles.itemPrice}>{plan.effectivePrice.formatted}</span>
                                                <span className={styles.strikePrice}>{plan.price.formatted}</span>
                                            </div>
                                        ) : (
                                            <span className={styles.itemPrice}>
                                                {plan.effectivePrice?.formatted || plan.price.formatted}
                                            </span>
                                        )}
                                        <PlanStatusBadge isActive={plan.isActive} />
                                    </div>
                                </div>
                            ))}
                            {plans.length === 0 && (
                                <div className={styles.emptyPrompt}>No subscription plans defined.</div>
                            )}
                        </div>
                    </div>

                    {/* Credit Packs Snapshot */}
                    <div className={styles.sectionCard}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardHeaderTitle}>
                                <h3 className={styles.cardTitle}>PRIORITY CREDIT PACKS</h3>
                                <span className={styles.badgeCount}>{creditPacks.length} packs</span>
                            </div>
                            <div className={styles.cardActions}>
                                <button
                                    type="button"
                                    className={styles.actionBtnSecondary}
                                    onClick={() => onNavigateTab(ADMIN_BILLING_TABS.CREDITS)}
                                >
                                    Manage Credits &rarr;
                                </button>
                                <button
                                    type="button"
                                    className={styles.actionBtnPrimary}
                                    onClick={onOpenCreateCreditPack}
                                >
                                    + New Pack
                                </button>
                            </div>
                        </div>

                        <div className={styles.itemList}>
                            {creditPacks.slice(0, 4).map((pack) => {
                                const effectiveAmount = pack.effectivePrice?.amount ?? pack.price.amount;
                                const unitPrice =
                                    pack.creditsCount > 0
                                        ? (effectiveAmount / pack.creditsCount).toFixed(2)
                                        : '0.00';
                                return (
                                    <div key={pack.id} className={styles.itemRow}>
                                        <div className={styles.itemMain}>
                                            <div className={styles.itemNameRow}>
                                                <span className={styles.itemName}>{pack.name}</span>
                                                {pack.badge && (
                                                    <span className={styles.promoBadge}>{pack.badge}</span>
                                                )}
                                            </div>
                                            <div className={styles.itemMeta}>
                                                <span>{pack.creditsCount} credits</span>
                                                <span>•</span>
                                                <span>₹{unitPrice} / credit</span>
                                            </div>
                                        </div>
                                        <div className={styles.itemAside}>
                                            {pack.effectivePrice && pack.effectivePrice.amount < pack.price.amount ? (
                                                <div className={styles.priceContainer}>
                                                    <span className={styles.itemPrice}>{pack.effectivePrice.formatted}</span>
                                                    <span className={styles.strikePrice}>{pack.price.formatted}</span>
                                                </div>
                                            ) : (
                                                <span className={styles.itemPrice}>
                                                    {pack.effectivePrice?.formatted || pack.price.formatted}
                                                </span>
                                            )}
                                            <BillingBadge variant={pack.isListed ? 'success' : 'muted'}>
                                                {pack.isListed ? 'LISTED' : 'HIDDEN'}
                                            </BillingBadge>
                                        </div>
                                    </div>
                                );
                            })}
                            {creditPacks.length === 0 && (
                                <div className={styles.emptyPrompt}>No priority credit packages configured.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Recent Financial Ledger Stream */}
                <div className={styles.ledgerColumn}>
                    <div className={styles.sectionCard}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardHeaderTitle}>
                                <h3 className={styles.cardTitle}>RECENT AUDIT STREAM</h3>
                                <span className={styles.badgeCount}>{totalTransactions} total</span>
                            </div>
                            <button
                                type="button"
                                className={styles.actionBtnSecondary}
                                onClick={() => onNavigateTab(ADMIN_BILLING_TABS.HISTORY)}
                            >
                                View Complete Ledger &rarr;
                            </button>
                        </div>

                        <div className={styles.transactionStream}>
                            {recentTransactions.map((txn) => (
                                <div
                                    key={txn.id}
                                    className={styles.streamRow}
                                    onClick={() => onSelectTransaction?.(txn)}
                                    role={onSelectTransaction ? 'button' : undefined}
                                    title="Inspect transaction audit record"
                                >
                                    <div className={styles.streamMain}>
                                        <div className={styles.streamTop}>
                                            <span className={styles.streamId}>{txn.id.slice(0, 10)}...</span>
                                            <TransactionTypeBadge type={txn.type} />
                                            <PaymentEnvironmentBadge environment={txn.environment} />
                                        </div>
                                        <div className={styles.streamDesc}>{txn.description}</div>
                                        <div className={styles.streamTimestamp}>
                                            {new Date(txn.createdAt).toLocaleDateString()} ·{' '}
                                            {new Date(txn.createdAt).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </div>
                                    </div>

                                    <div className={styles.streamAside}>
                                        <span className={styles.streamAmount}>
                                            {txn.amount ? txn.amount.formatted : '—'}
                                        </span>
                                        <TransactionStatusBadge status={txn.status} />
                                    </div>
                                </div>
                            ))}

                            {recentTransactions.length === 0 && (
                                <div className={styles.emptyPrompt}>No transactions recorded in the platform.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
