import React from 'react';
import type { AdminSubscriptionPlanDto } from '../../types/admin-billing.types';
import { AdminTable, type AdminTableColumn } from '../../../../../shared/admin/components/admin-table.component';
import styles from './plan-list-table.module.css';

export interface PlanListTableProps {
    plans: AdminSubscriptionPlanDto[];
    isLoading?: boolean;
    isFetching?: boolean;
    onEditPlan: (plan: AdminSubscriptionPlanDto) => void;
    onManageOffers: (plan: AdminSubscriptionPlanDto) => void;
    onToggleStatus: (plan: AdminSubscriptionPlanDto) => void;
    onViewPlan?: (plan: AdminSubscriptionPlanDto) => void;
    togglingPlanId?: string | null;
}

export const PlanListTable: React.FC<PlanListTableProps> = ({
    plans,
    isLoading = false,
    isFetching = false,
    onEditPlan,
    onManageOffers,
    onToggleStatus,
    onViewPlan,
    togglingPlanId = null,
}) => {
    const columns: AdminTableColumn<AdminSubscriptionPlanDto>[] = [
        {
            header: 'PLAN NAME',
            render: (plan) => (
                <div
                    className={styles.planNameCell}
                    onClick={() => onViewPlan?.(plan)}
                    title="Click to view plan details"
                >
                    <span className={styles.planName}>{plan.name}</span>
                    <span className={styles.planCode}>{plan.code}</span>
                </div>
            ),
        },
        {
            header: 'BILLING PERIOD',
            render: (plan) => (
                <span className={styles.periodBadge}>{plan.billingPeriod}</span>
            ),
        },
        {
            header: 'PRICE',
            render: (plan) => {
                const hasDiscount =
                    plan.effectivePrice && plan.effectivePrice.amount < plan.price.amount;
                return (
                    <div className={styles.priceCell}>
                        <span className={styles.priceFormatted}>
                            {plan.effectivePrice?.formatted || plan.price?.formatted}
                        </span>
                        {hasDiscount && (
                            <span className={styles.strikePrice}>{plan.price.formatted}</span>
                        )}
                    </div>
                );
            },
        },
        {
            header: 'ENTITLEMENTS',
            render: (plan) => (
                <div className={styles.entitlementsList}>
                    {plan.entitlements.map((ent) => (
                        <span key={ent} className={styles.entitlementPill}>
                            {ent === 'SCENE_PARTNER_ACCESS'
                                ? 'Scene Partner'
                                : ent === 'LUMEN_HIGH_QUOTA'
                                ? 'Lumen Quota'
                                : 'Deep Filters'}
                        </span>
                    ))}
                </div>
            ),
        },
        {
            header: 'OFFERS',
            render: (plan) => {
                const activeOffersCount = plan.offers?.filter((o) => o.isActive).length ?? 0;
                return (
                    <button
                        type="button"
                        className={`${styles.offersBtn} ${activeOffersCount > 0 ? styles.offersActive : styles.noOffers}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onManageOffers(plan);
                        }}
                        title="Manage promotional offers for this plan"
                    >
                        {activeOffersCount > 0
                            ? `${activeOffersCount} ACTIVE OFFER${activeOffersCount > 1 ? 'S' : ''}`
                            : 'MANAGE OFFERS'}
                    </button>
                );
            },
        },
        {
            header: 'STATUS',
            render: (plan) => {
                const isToggling = togglingPlanId === plan.id;
                return (
                    <button
                        type="button"
                        className={styles.statusToggleBtn}
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleStatus(plan);
                        }}
                        disabled={isToggling}
                        title={plan.isActive ? 'Disable plan' : 'Enable plan'}
                    >
                        <div
                            className={`${styles.switchTrack} ${
                                plan.isActive ? styles.switchTrackActive : ''
                            }`}
                        >
                            <div
                                className={`${styles.switchThumb} ${
                                    plan.isActive ? styles.switchThumbActive : ''
                                }`}
                            />
                        </div>
                        <span
                            className={`${styles.statusText} ${
                                plan.isActive ? styles.statusTextActive : styles.statusTextInactive
                            }`}
                        >
                            {plan.isActive ? 'ENABLED' : 'DISABLED'}
                        </span>
                    </button>
                );
            },
        },
        {
            header: 'ACTIONS',
            render: (plan) => (
                <div className={styles.actionsGroup}>
                    <button
                        type="button"
                        className={styles.actionIconBtn}
                        onClick={(e) => {
                            e.stopPropagation();
                            onEditPlan(plan);
                        }}
                        title="Edit Plan"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                        </svg>
                    </button>
                    {onViewPlan && (
                        <button
                            type="button"
                            className={styles.actionIconBtn}
                            onClick={(e) => {
                                e.stopPropagation();
                                onViewPlan(plan);
                            }}
                            title="View Plan Details"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className={styles.container}>
            <AdminTable
                columns={columns}
                data={plans}
                keyExtractor={(plan) => plan.id}
                isLoading={isLoading}
                isFetching={isFetching}
                loadingMessage="LOADING SUBSCRIPTION PLANS..."
                emptyMessage="NO SUBSCRIPTION PLANS CONFIGURED."
                onRowClick={onViewPlan}
            />
        </div>
    );
};
