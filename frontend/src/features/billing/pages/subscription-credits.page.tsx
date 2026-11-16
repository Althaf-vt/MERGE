import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    useGetUserSubscriptionQuery,
    useGetPlansQuery,
    useGetCreditPacksQuery,
    useGetUserCreditBalanceQuery,
    useGetBillingHistoryQuery,
} from '../api/billing.api';
import { useBillingPayment } from '../hooks/use-billing-payment.hook';
import { SubscriptionStatusCard } from '../components/hub/subscription-status-card.component';
import { CreditBalanceCard } from '../components/hub/credit-balance-card.component';
import { CreditStoreCatalog } from '../components/credits/credit-store-catalog.component';
import { CheckoutSummaryCard } from '../components/credits/checkout-summary-card.component';
import { MiniBillingHistory } from '../components/hub/mini-billing-history.component';
import { MiniCreditHistory } from '../components/hub/mini-credit-history.component';
import { UpgradePlanModal } from '../components/subscription/upgrade-plan-modal.component';
import { PaymentSuccessModal } from '../components/payment/payment-success-modal.component';
import { PaymentFailedModal } from '../components/payment/payment-failed-modal.component';
import { BILLING_ROUTES } from '../constants/billing.constants';
import type { CreditPackDto, SubscriptionPlanDto } from '../types/billing.types';
import { formatCurrencyDisplay } from '../utils/currency.util';
import styles from './subscription-credits.module.css';

export const SubscriptionCreditsPage: React.FC = () => {
    const navigate = useNavigate();
    const storeRef = useRef<HTMLDivElement>(null);

    const [selectedPack, setSelectedPack] = useState<CreditPackDto | null>(null);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    const paymentHook = useBillingPayment();

    const {
        data: subscriptionResponse,
        isLoading: isSubscriptionLoading,
    } = useGetUserSubscriptionQuery();

    const {
        data: plansResponse,
        isLoading: isPlansLoading,
    } = useGetPlansQuery();

    const {
        data: packsResponse,
        isLoading: isPacksLoading,
    } = useGetCreditPacksQuery();

    const {
        data: balanceResponse,
        isLoading: isBalanceLoading,
    } = useGetUserCreditBalanceQuery();

    const {
        data: historyResponse,
        isLoading: isHistoryLoading,
    } = useGetBillingHistoryQuery({ page: 1, limit: 10 });

    const subscription = subscriptionResponse?.data ?? null;
    const plans = plansResponse?.data ?? [];
    const packs = packsResponse?.data ?? [];
    const balance = balanceResponse?.data?.balance ?? 0;
    const transactions = historyResponse?.data ?? [];

    const activePlan = plans.find((p) => p.id === subscription?.planId);
    const planName = activePlan?.name || (subscription?.isActive ? 'MERGE Premium' : 'Free Tier');

    // Default select popular or second pack if available, otherwise first
    useEffect(() => {
        if (packs.length > 0 && !selectedPack) {
            const popularPack = packs.find((p) => p.badge?.toLowerCase().includes('popular')) || packs[1] || packs[0];
            setSelectedPack(popularPack);
        }
    }, [packs, selectedPack]);

    const handleScrollToStore = () => {
        storeRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSelectPromoPack = () => {
        const promoPack = packs.find((p) => p.creditsCount === 20) || packs[1] || packs[0];
        if (promoPack) {
            setSelectedPack(promoPack);
        }
        handleScrollToStore();
    };

    const handleCheckoutPack = () => {
        if (!selectedPack) return;
        paymentHook.startCheckout({
            itemId: selectedPack.id,
            itemType: 'CREDIT_PACK',
            itemName: selectedPack.name.replace(/\s*\(\d+\s*Credits\)/i, '').trim(),
            amountFormatted: formatCurrencyDisplay(selectedPack.price.formatted),
        });
    };

    const handleUpgradePlan = (plan: SubscriptionPlanDto) => {
        setIsUpgradeModalOpen(false);
        paymentHook.startCheckout({
            itemId: plan.id,
            itemType: 'PLAN',
            itemName: plan.name,
            amountFormatted: formatCurrencyDisplay(plan.effectivePrice?.formatted || plan.price.formatted),
        });
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <h2 className={styles.pageTitle}>Subscription & Credits</h2>
                <p className={styles.pageSubtitle}>
                    Manage your current plan, auto-renewal preferences, and platform action credits.
                </p>
            </div>

            <div className={styles.topGrid}>
                <SubscriptionStatusCard
                    subscription={subscription}
                    planName={planName}
                    isLoading={isSubscriptionLoading}
                    onManageSubscription={() => navigate(BILLING_ROUTES.MANAGE)}
                    onUpgrade={() => setIsUpgradeModalOpen(true)}
                />

                <CreditBalanceCard
                    balance={balance}
                    isLoading={isBalanceLoading}
                    onBuyCredits={handleScrollToStore}
                />
            </div>

            <div ref={storeRef} className={styles.storeSection}>
                <div className={styles.storeLayout}>
                    <CreditStoreCatalog
                        packs={packs}
                        selectedPackId={selectedPack?.id}
                        onSelectPack={(pack) => setSelectedPack(pack)}
                        isLoading={isPacksLoading}
                    />

                    <CheckoutSummaryCard
                        itemName={selectedPack?.name}
                        itemDescription={selectedPack ? `${selectedPack.creditsCount} Priority Introductions` : undefined}
                        amountFormatted={selectedPack?.price.formatted}
                        isProcessing={paymentHook.isProcessing}
                        onContinueToPayment={handleCheckoutPack}
                        disabled={!selectedPack}
                    />
                </div>
            </div>

            <div className={styles.historyGrid}>
                <MiniBillingHistory
                    transactions={transactions}
                    isLoading={isHistoryLoading}
                    onViewAll={() => navigate(BILLING_ROUTES.HISTORY)}
                />

                <MiniCreditHistory
                    transactions={transactions}
                    isLoading={isHistoryLoading}
                    onViewAll={() => navigate(BILLING_ROUTES.CREDIT_HISTORY)}
                />
            </div>

            <div className={styles.promoBanner}>
                <div className={styles.promoContent}>
                    <div className={styles.promoIcon}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                    </div>
                    <div className={styles.promoTexts}>
                        <h4 className={styles.promoTitle}>Need more credits?</h4>
                        <p className={styles.promoSubtitle}>
                            Get 20 Credits and unlock more meaningful connections with direct Priority Introductions.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    className={styles.promoButton}
                    onClick={handleSelectPromoPack}
                >
                    <span>Get 20 Credits</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                </button>
            </div>

            <UpgradePlanModal
                isOpen={isUpgradeModalOpen}
                onClose={() => setIsUpgradeModalOpen(false)}
                plans={plans}
                isLoading={isPlansLoading}
                isProcessing={paymentHook.isProcessing}
                onUpgrade={handleUpgradePlan}
            />

            <PaymentSuccessModal
                isOpen={paymentHook.isSuccessModalOpen}
                onClose={paymentHook.closeSuccessModal}
                itemName={paymentHook.successDetails?.itemName || 'MERGE Credits'}
                amountFormatted={paymentHook.successDetails?.amountFormatted}
                referenceId={paymentHook.successDetails?.referenceId}
                isSubscription={false}
                onPrimaryAction={paymentHook.closeSuccessModal}
                onSecondaryAction={() => {
                    paymentHook.closeSuccessModal();
                    navigate(BILLING_ROUTES.CREDIT_HISTORY);
                }}
            />

            <PaymentFailedModal
                isOpen={paymentHook.isFailedModalOpen}
                onClose={paymentHook.closeFailedModal}
                errorMessage={paymentHook.paymentError || undefined}
                onRetry={paymentHook.retryPayment}
            />
        </div>
    );
};
