import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AdminPageTransition } from '../../../../shared/admin/components/admin-page-transition.component';
import {
    useGetAdminPlansQuery,
    useGetAdminCreditPacksQuery,
    useGetAdminTransactionsQuery,
    useUpdateAdminPlanMutation,
    useUpdateAdminCreditPackMutation,
} from '../api/admin-billing.api';
import {
    ADMIN_BILLING_TABS,
    ADMIN_BILLING_TAB_CONFIG,
    type AdminBillingTab,
} from '../constants/admin-billing.constants';
import type {
    SubscriptionPlanDto,
    CreditPackDto,
    AdminBillingTransactionDto,
    BillingTransactionType,
    TransactionStatus,
} from '../types/admin-billing.types';
import { BillingOverviewTab } from '../components/overview/billing-overview-tab.component';
import { PlanListTable } from '../components/plans/plan-list-table.component';
import { PlanFormModal } from '../components/plans/plan-form-modal.component';
import { PlanOffersModal } from '../components/plans/plan-offers-modal.component';
import { CreditPackTable } from '../components/credits/credit-pack-table.component';
import { CreditPackFormModal } from '../components/credits/credit-pack-form-modal.component';
import { CreditPackOffersModal } from '../components/credits/credit-pack-offers-modal.component';
import { TransactionFilters } from '../components/transactions/transaction-filters.component';
import { TransactionListTable } from '../components/transactions/transaction-list-table.component';
import { TransactionDetailDrawer } from '../components/transactions/transaction-detail-drawer.component';
import { exportTransactionsToCsv } from '../utils/admin-billing-export.util';
import styles from './admin-billing-management.module.css';

const DEFAULT_TXN_LIMIT = 20;

export const AdminBillingManagementPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const tabParam = searchParams.get('tab') as AdminBillingTab | null;
    const initialTab: AdminBillingTab =
        tabParam && Object.values(ADMIN_BILLING_TABS).includes(tabParam)
            ? tabParam
            : ADMIN_BILLING_TABS.OVERVIEW;

    const [activeTab, setActiveTab] = useState<AdminBillingTab>(initialTab);

    // Plans tab modal states
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<SubscriptionPlanDto | null>(null);
    const [isOffersModalOpen, setIsOffersModalOpen] = useState(false);
    const [selectedPlanIdForOffers, setSelectedPlanIdForOffers] = useState<string | null>(null);

    // Credit Packs tab modal states
    const [isCreditPackModalOpen, setIsCreditPackModalOpen] = useState(false);
    const [editingCreditPack, setEditingCreditPack] = useState<CreditPackDto | null>(null);
    const [isCreditPackOffersModalOpen, setIsCreditPackOffersModalOpen] = useState(false);
    const [selectedCreditPackIdForOffers, setSelectedCreditPackIdForOffers] = useState<string | null>(null);

    // Transactions History tab filter & pagination states
    const [txnPage, setTxnPage] = useState(1);
    const [txnUserId, setTxnUserId] = useState('');
    const [txnType, setTxnType] = useState<BillingTransactionType | ''>('');
    const [txnStatus, setTxnStatus] = useState<TransactionStatus | ''>('');
    const [txnFromDate, setTxnFromDate] = useState('');
    const [txnToDate, setTxnToDate] = useState('');

    // Transaction inspection drawer state
    const [selectedTxn, setSelectedTxn] = useState<AdminBillingTransactionDto | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Queries
    const {
        data: plansData,
        isLoading: isPlansLoading,
        isFetching: isPlansFetching,
        refetch: refetchPlans,
    } = useGetAdminPlansQuery();

    const {
        data: creditPacksData,
        isLoading: isCreditPacksLoading,
        isFetching: isCreditPacksFetching,
        refetch: refetchCreditPacks,
    } = useGetAdminCreditPacksQuery();

    const {
        data: txnsData,
        isLoading: isTxnsLoading,
        isFetching: isTxnsFetching,
        refetch: refetchTxns,
    } = useGetAdminTransactionsQuery({
        page: txnPage,
        limit: DEFAULT_TXN_LIMIT,
        userId: txnUserId || undefined,
        type: txnType || undefined,
        status: txnStatus || undefined,
        fromDate: txnFromDate || undefined,
        toDate: txnToDate || undefined,
    });

    // Mutations for toggles
    const [updatePlan] = useUpdateAdminPlanMutation();
    const [updateCreditPack] = useUpdateAdminCreditPackMutation();

    const plans = plansData?.data || [];
    const creditPacks = creditPacksData?.data || [];
    const transactions = txnsData?.data || [];
    const totalTransactions = txnsData?.meta?.total || transactions.length;

    const selectedPlanForOffers =
        plans.find((p) => p.id === selectedPlanIdForOffers) || null;
    const selectedCreditPackForOffers =
        creditPacks.find((c) => c.id === selectedCreditPackIdForOffers) || null;

    const isGlobalRefreshing = isPlansFetching || isCreditPacksFetching || isTxnsFetching;

    const handleTabChange = (tab: AdminBillingTab) => {
        setActiveTab(tab);
        setSearchParams({ tab });
    };

    const handleRefreshAll = () => {
        refetchPlans();
        refetchCreditPacks();
        refetchTxns();
    };

    // Plans Actions
    const handleOpenCreatePlan = () => {
        setEditingPlan(null);
        setIsPlanModalOpen(true);
    };

    const handleEditPlan = (plan: SubscriptionPlanDto) => {
        setEditingPlan(plan);
        setIsPlanModalOpen(true);
    };

    const handleManageOffers = (plan: SubscriptionPlanDto) => {
        setSelectedPlanIdForOffers(plan.id);
        setIsOffersModalOpen(true);
    };

    const handleTogglePlanStatus = async (plan: SubscriptionPlanDto) => {
        try {
            await updatePlan({
                id: plan.id,
                payload: { isActive: !plan.isActive },
            }).unwrap();
        } catch (err) {
            console.error('Failed to toggle plan status:', err);
        }
    };

    // Credit Packs Actions
    const handleOpenCreateCreditPack = () => {
        setEditingCreditPack(null);
        setIsCreditPackModalOpen(true);
    };

    const handleEditCreditPack = (pack: CreditPackDto) => {
        setEditingCreditPack(pack);
        setIsCreditPackModalOpen(true);
    };

    const handleManageCreditPackOffers = (pack: CreditPackDto) => {
        setSelectedCreditPackIdForOffers(pack.id);
        setIsCreditPackOffersModalOpen(true);
    };

    const handleToggleCreditPackStatus = async (pack: CreditPackDto) => {
        try {
            await updateCreditPack({
                id: pack.id,
                payload: { isActive: !pack.isActive },
            }).unwrap();
        } catch (err) {
            console.error('Failed to toggle credit pack status:', err);
        }
    };

    const handleToggleCreditPackListed = async (pack: CreditPackDto) => {
        try {
            await updateCreditPack({
                id: pack.id,
                payload: { isListed: !pack.isListed },
            }).unwrap();
        } catch (err) {
            console.error('Failed to toggle credit pack listed state:', err);
        }
    };

    // Transactions History Actions
    const handleResetFilters = () => {
        setTxnUserId('');
        setTxnType('');
        setTxnStatus('');
        setTxnFromDate('');
        setTxnToDate('');
        setTxnPage(1);
    };

    const handleSelectTransaction = (transaction: AdminBillingTransactionDto) => {
        setSelectedTxn(transaction);
        setIsDrawerOpen(true);
    };

    const handleExportCsv = () => {
        if (transactions.length === 0) return;
        exportTransactionsToCsv(transactions);
    };

    return (
        <AdminPageTransition>
            <div className={styles.container}>
                {/* Header Command Bar */}
                <header className={styles.header}>
                    <div className={styles.titleArea}>
                        <h1 className={styles.title}>Subscriptions & Billing</h1>
                        <span className={styles.subtitle}>
                            Commercial tiers, priority credit inventory & financial audit ledger
                        </span>
                    </div>

                    <div className={styles.headerControls}>
                        <button
                            type="button"
                            className={styles.secondaryBtn}
                            onClick={handleRefreshAll}
                            disabled={isGlobalRefreshing}
                            title="Refetch all monetization queries"
                        >
                            {isGlobalRefreshing ? 'REFRESHING...' : 'REFRESH DATA'}
                        </button>

                        <button
                            type="button"
                            className={styles.secondaryBtn}
                            onClick={handleExportCsv}
                            disabled={transactions.length === 0}
                            title="Export loaded transactions to CSV"
                        >
                            EXPORT CSV
                        </button>

                        {activeTab === ADMIN_BILLING_TABS.PLANS && (
                            <button
                                type="button"
                                className={styles.primaryBtn}
                                onClick={handleOpenCreatePlan}
                            >
                                + CREATE PLAN
                            </button>
                        )}

                        {activeTab === ADMIN_BILLING_TABS.CREDITS && (
                            <button
                                type="button"
                                className={styles.primaryBtn}
                                onClick={handleOpenCreateCreditPack}
                            >
                                + CREATE CREDIT PACK
                            </button>
                        )}
                    </div>
                </header>

                {/* Sub-view Navigation Tabs */}
                <nav className={styles.tabNavigation} aria-label="Monetization Management Tabs">
                    {ADMIN_BILLING_TAB_CONFIG.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            className={`${styles.tabBtn} ${
                                activeTab === tab.key ? styles.tabBtnActive : ''
                            }`}
                            onClick={() => handleTabChange(tab.key)}
                            title={tab.description}
                        >
                            {tab.label.toUpperCase()}
                        </button>
                    ))}
                </nav>

                {/* Active Tab View */}
                <main className={styles.tabContent}>
                    {activeTab === ADMIN_BILLING_TABS.OVERVIEW && (
                        <BillingOverviewTab
                            plans={plans}
                            creditPacks={creditPacks}
                            transactions={transactions}
                            totalTransactions={totalTransactions}
                            isLoading={isPlansLoading || isCreditPacksLoading || isTxnsLoading}
                            onNavigateTab={handleTabChange}
                            onOpenCreatePlan={handleOpenCreatePlan}
                            onOpenCreateCreditPack={handleOpenCreateCreditPack}
                            onSelectTransaction={handleSelectTransaction}
                        />
                    )}

                    {activeTab === ADMIN_BILLING_TABS.PLANS && (
                        <div className={styles.viewSection}>
                            <PlanListTable
                                plans={plans}
                                isLoading={isPlansLoading}
                                isFetching={isPlansFetching}
                                onEditPlan={handleEditPlan}
                                onToggleStatus={handleTogglePlanStatus}
                                onManageOffers={handleManageOffers}
                            />
                        </div>
                    )}

                    {activeTab === ADMIN_BILLING_TABS.CREDITS && (
                        <div className={styles.viewSection}>
                            <CreditPackTable
                                creditPacks={creditPacks}
                                isLoading={isCreditPacksLoading}
                                isFetching={isCreditPacksFetching}
                                onEditPack={handleEditCreditPack}
                                onManageOffers={handleManageCreditPackOffers}
                                onToggleActive={handleToggleCreditPackStatus}
                                onToggleListed={handleToggleCreditPackListed}
                            />
                        </div>
                    )}

                    {activeTab === ADMIN_BILLING_TABS.HISTORY && (
                        <div className={styles.viewSection}>
                            <TransactionFilters
                                userId={txnUserId}
                                type={txnType}
                                status={txnStatus}
                                fromDate={txnFromDate}
                                toDate={txnToDate}
                                onUserIdChange={(val) => {
                                    setTxnUserId(val);
                                    setTxnPage(1);
                                }}
                                onTypeChange={(val) => {
                                    setTxnType(val);
                                    setTxnPage(1);
                                }}
                                onStatusChange={(val) => {
                                    setTxnStatus(val);
                                    setTxnPage(1);
                                }}
                                onFromDateChange={(val) => {
                                    setTxnFromDate(val);
                                    setTxnPage(1);
                                }}
                                onToDateChange={(val) => {
                                    setTxnToDate(val);
                                    setTxnPage(1);
                                }}
                                onResetFilters={handleResetFilters}
                                hasActiveFilters={Boolean(
                                    txnUserId || txnType || txnStatus || txnFromDate || txnToDate
                                )}
                            />

                            <TransactionListTable
                                transactions={transactions}
                                total={totalTransactions}
                                page={txnPage}
                                limit={DEFAULT_TXN_LIMIT}
                                isLoading={isTxnsLoading}
                                isFetching={isTxnsFetching}
                                onPageChange={setTxnPage}
                                onSelectTransaction={handleSelectTransaction}
                            />
                        </div>
                    )}
                </main>

                {/* Modals & Slide-out Drawers */}
                <PlanFormModal
                    isOpen={isPlanModalOpen}
                    plan={editingPlan}
                    onClose={() => {
                        setIsPlanModalOpen(false);
                        setEditingPlan(null);
                    }}
                />

                <PlanOffersModal
                    isOpen={isOffersModalOpen}
                    plan={selectedPlanForOffers}
                    onClose={() => {
                        setIsOffersModalOpen(false);
                        setSelectedPlanIdForOffers(null);
                    }}
                />

                <CreditPackFormModal
                    isOpen={isCreditPackModalOpen}
                    pack={editingCreditPack}
                    onClose={() => {
                        setIsCreditPackModalOpen(false);
                        setEditingCreditPack(null);
                    }}
                />

                <CreditPackOffersModal
                    isOpen={isCreditPackOffersModalOpen}
                    pack={selectedCreditPackForOffers}
                    onClose={() => {
                        setIsCreditPackOffersModalOpen(false);
                        setSelectedCreditPackIdForOffers(null);
                    }}
                />

                <TransactionDetailDrawer
                    isOpen={isDrawerOpen}
                    transaction={selectedTxn}
                    onClose={() => {
                        setIsDrawerOpen(false);
                        setSelectedTxn(null);
                    }}
                />
            </div>
        </AdminPageTransition>
    );
};
