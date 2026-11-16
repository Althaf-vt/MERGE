import { useState, useRef, useCallback } from 'react';
import { useAppSelector } from '../../../app/hooks';
import { useCreatePaymentOrderMutation, useVerifyPaymentMutation } from '../api/billing.api';
import { launchRazorpayCheckout } from '../utils/razorpay-loader.util';
import type { BillingItemType } from '../types/billing.types';
import { getErrorMessage } from '../../../shared/utils/error.util';

export interface StartCheckoutParams {
    itemId: string;
    itemType: BillingItemType;
    itemName: string;
    amountFormatted?: string;
    promoCode?: string;
}

export interface PaymentSuccessDetails {
    itemName: string;
    amountFormatted?: string;
    referenceId?: string;
    isSubscription: boolean;
}

export const useBillingPayment = () => {
    const { user } = useAppSelector((state) => state.auth);

    const [createPaymentOrder] = useCreatePaymentOrderMutation();
    const [verifyPayment] = useVerifyPaymentMutation();

    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isFailedModalOpen, setIsFailedModalOpen] = useState(false);
    const [successDetails, setSuccessDetails] = useState<PaymentSuccessDetails | null>(null);

    const lastAttemptRef = useRef<StartCheckoutParams | null>(null);

    const closeSuccessModal = useCallback(() => {
        setIsSuccessModalOpen(false);
        setSuccessDetails(null);
    }, []);

    const closeFailedModal = useCallback(() => {
        setIsFailedModalOpen(false);
        setPaymentError(null);
    }, []);

    const startCheckout = useCallback(
        async (params: StartCheckoutParams): Promise<boolean> => {
            setIsProcessing(true);
            setPaymentError(null);
            lastAttemptRef.current = params;

            try {
                // Step 1: Create payment order on the backend
                const orderResponse = await createPaymentOrder({
                    itemId: params.itemId,
                    itemType: params.itemType,
                    promoCode: params.promoCode,
                }).unwrap();

                const order = orderResponse.data;
                if (!order) {
                    throw new Error('Failed to create payment order from gateway.');
                }

                // Step 2: Launch the Razorpay modal
                const launched = await launchRazorpayCheckout({
                    orderId: order.orderId,
                    amount: order.amount,
                    keyId: order.keyId,
                    currency: order.currency,
                    itemName: order.itemName || params.itemName,
                    customer: {
                        name: user?.profile?.displayName || '',
                        email: user?.email || '',
                    },
                    onSuccess: async (razorpayResponse) => {
                        try {
                            // Step 3: Cryptographically verify HMAC payment signature
                            const verifyResponse = await verifyPayment({
                                orderId: razorpayResponse.razorpay_order_id,
                                paymentId: razorpayResponse.razorpay_payment_id,
                                signature: razorpayResponse.razorpay_signature,
                                itemId: params.itemId,
                                itemType: params.itemType,
                                promoCode: params.promoCode,
                            }).unwrap();

                            setSuccessDetails({
                                itemName: params.itemName,
                                amountFormatted: params.amountFormatted,
                                referenceId:
                                    razorpayResponse.razorpay_payment_id || verifyResponse.data?.referenceId,
                                isSubscription: params.itemType === 'PLAN',
                            });
                            setIsSuccessModalOpen(true);
                        } catch (verifyErr) {
                            const errorMsg = getErrorMessage(
                                verifyErr,
                                'Payment verification failed. Please contact support.',
                            );
                            setPaymentError(errorMsg);
                            setIsFailedModalOpen(true);
                        } finally {
                            setIsProcessing(false);
                        }
                    },
                    onDismiss: () => {
                        setIsProcessing(false);
                    },
                    onError: (err) => {
                        setPaymentError(err.message || 'Payment was cancelled or failed.');
                        setIsFailedModalOpen(true);
                        setIsProcessing(false);
                    },
                });

                if (!launched) {
                    setIsProcessing(false);
                    return false;
                }

                return true;
            } catch (err) {
                const errorMsg = getErrorMessage(err, 'Unable to initiate checkout. Please try again.');
                setPaymentError(errorMsg);
                setIsFailedModalOpen(true);
                setIsProcessing(false);
                return false;
            }
        },
        [createPaymentOrder, verifyPayment, user],
    );

    const retryPayment = useCallback(() => {
        setIsFailedModalOpen(false);
        if (lastAttemptRef.current) {
            startCheckout(lastAttemptRef.current);
        }
    }, [startCheckout]);

    return {
        isProcessing,
        paymentError,
        isSuccessModalOpen,
        isFailedModalOpen,
        successDetails,
        startCheckout,
        retryPayment,
        closeSuccessModal,
        closeFailedModal,
    };
};
