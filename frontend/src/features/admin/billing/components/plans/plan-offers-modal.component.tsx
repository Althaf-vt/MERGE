import React from 'react';
import type {
    AdminSubscriptionPlanDto,
    PlanOfferInputPayload,
} from '../../types/admin-billing.types';
import { useUpdateAdminPlanMutation } from '../../api/admin-billing.api';
import { PromotionalOffersModal } from '../shared/promotional-offers-modal.component';

export interface PlanOffersModalProps {
    isOpen: boolean;
    plan: AdminSubscriptionPlanDto | null;
    onClose: () => void;
}

export const PlanOffersModal: React.FC<PlanOffersModalProps> = ({
    isOpen,
    plan,
    onClose,
}) => {
    const [updatePlan, { isLoading: isUpdating }] = useUpdateAdminPlanMutation();

    const handleUpdateOffers = async (id: string, offers: PlanOfferInputPayload[]) => {
        await updatePlan({
            id,
            payload: { offers },
        }).unwrap();
    };

    return (
        <PromotionalOffersModal
            isOpen={isOpen}
            item={plan}
            itemTypeLabel="Plan"
            onClose={onClose}
            onUpdateOffers={handleUpdateOffers}
            isUpdating={isUpdating}
        />
    );
};
