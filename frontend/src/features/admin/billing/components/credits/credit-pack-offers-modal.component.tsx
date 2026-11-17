import React from 'react';
import type {
    AdminCreditPackDto,
    PlanOfferInputPayload,
} from '../../types/admin-billing.types';
import { useUpdateAdminCreditPackMutation } from '../../api/admin-billing.api';
import { PromotionalOffersModal } from '../shared/promotional-offers-modal.component';

export interface CreditPackOffersModalProps {
    isOpen: boolean;
    pack: AdminCreditPackDto | null;
    onClose: () => void;
}

export const CreditPackOffersModal: React.FC<CreditPackOffersModalProps> = ({
    isOpen,
    pack,
    onClose,
}) => {
    const [updateCreditPack, { isLoading: isUpdating }] = useUpdateAdminCreditPackMutation();

    const handleUpdateOffers = async (id: string, offers: PlanOfferInputPayload[]) => {
        const res = await updateCreditPack({
            id,
            payload: { offers },
        }).unwrap();
        return res.data?.offers;
    };

    return (
        <PromotionalOffersModal
            isOpen={isOpen}
            item={pack}
            itemTypeLabel="Credit Package"
            onClose={onClose}
            onUpdateOffers={handleUpdateOffers}
            isUpdating={isUpdating}
        />
    );
};
