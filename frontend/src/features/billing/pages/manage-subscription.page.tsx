import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    useGetUserSubscriptionQuery,
    useGetPlansQuery,
    useToggleAutoRenewMutation,
    useCancelSubscriptionMutation,
} from '../api/billing.api';
import { useBillingPayment } from '../hooks/use-billing-payment.hook';
import { ManageSubscriptionCard } from '../components/subscription/manage-subscription-card.component';
import { CancelSubscriptionModal } from '../components/subscription/cancel-subscription-modal.component';
import { UpgradePlanModal } from '../components/subscription/upgrade-plan-modal.component';
import { PaymentSuccessModal } from '../components/payment/payment-success-modal.component';
import { PaymentFailedModal } from '../components/payment/payment-failed-modal.component';
import { BILLING_ROUTES } from '../constants/billing.constants';
import type { SubscriptionPlanDto } from '../types/billing.types';
import { toast } from '../../../shared/utils/toast.util';
import { getErrorMessage } from '../../../shared/utils/error.util';
import { formatCurrencyDisplay } from '../utils/currency.util';
import styles from './manage-subscription.module.css';

export const ManageSubscriptionPage: React.FC = () => {
    const navigate = useNavigate();

    const {
        data: subscriptionResponse,
        isLoading: isSubscriptionLoading,
    } = useGetUserSubscriptionQuery();

    const {
        data: plansResponse,
        isLoading: isPlansLoading,
    } = useGetPlansQuery();

    const [toggleAutoRenew, { isLoading: isUpdatingAutoRenew }] = useToggleAutoRenewMutation();
    const [cancelSubscription, { isLoading: isCancelling }] = useCancelSubscriptionMutation();

    const paymentHook = useBillingPayment();

    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    const subscription = subscriptionResponse?.data ?? null;
    const plans = plansResponse?.data ?? [];

    // Find active plan details
    const activePlan = plans.find((p) => p.id === subscription?.planId);
    const planName = activePlan?.name || 'PREMIUM';
    const rawPrice = activePlan?.effectivePrice?.formatted || activePlan?.price.formatted;
    const planPriceFormatted = rawPrice ? formatCurrencyDisplay(rawPrice) : '₹999 / month';
    const billingPeriodLabel =
        activePlan?.billingPeriod === 'ANNUAL'
            ? 'Annual Billing'
            : activePlan?.billingPeriod === 'QUARTERLY'
              ? 'Quarterly Billing'
              : 'Monthly Billing';

    const handleToggleAutoRenew = async (autoRenew: boolean) => {
        try {
            await toggleAutoRenew({ autoRenew }).unwrap();
            toast.success(
                autoRenew
                    ? 'Auto-renewal has been successfully activated.'
                    : 'Auto-renewal has been paused. Your access remains active until period end.',
            );
        } catch (err) {
            const errorMsg = getErrorMessage(err, 'Failed to update auto-renewal preferences.');
            toast.error(errorMsg);
        }
    };

    const handleConfirmCancel = async (reason?: string) => {
        try {
            await cancelSubscription({ reason }).unwrap();
            setIsCancelModalOpen(false);
            toast.success('Your subscription auto-renewal has been cancelled.');
        } catch (err) {
            const errorMsg = getErrorMessage(err, 'Failed to cancel subscription.');
            toast.error(errorMsg);
        }
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
                <h2 className={styles.pageTitle}>Manage Subscription</h2>
                <p className={styles.pageSubtitle}>
                    View and manage your MERGE Premium membership, renewal preferences, and benefits.
                </p>
            </div>

            <ManageSubscriptionCard
                subscription={subscription}
                planName={planName}
                planPriceFormatted={planPriceFormatted}
                billingPeriodLabel={billingPeriodLabel}
                isLoading={isSubscriptionLoading}
                isUpdatingAutoRenew={isUpdatingAutoRenew}
                onToggleAutoRenew={handleToggleAutoRenew}
                onViewBillingHistory={() => navigate(BILLING_ROUTES.HISTORY)}
                onCancelSubscription={() => setIsCancelModalOpen(true)}
                onUpgrade={() => setIsUpgradeModalOpen(true)}
            />

            <CancelSubscriptionModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                onConfirm={handleConfirmCancel}
                isSubmitting={isCancelling}
                currentPeriodEnd={subscription?.currentPeriodEnd}
            />

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
                itemName={paymentHook.successDetails?.itemName || 'MERGE Premium'}
                amountFormatted={paymentHook.successDetails?.amountFormatted}
                referenceId={paymentHook.successDetails?.referenceId}
                isSubscription={true}
                onPrimaryAction={paymentHook.closeSuccessModal}
                onSecondaryAction={() => {
                    paymentHook.closeSuccessModal();
                    navigate('/scene-partner');
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
