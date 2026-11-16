import { RAZORPAY_CONFIG } from '../constants/billing.constants';
import type { RazorpayCheckoutOptions, RazorpayPaymentSuccessResponse } from '../types/billing.types';

declare global {
    interface Window {
        Razorpay?: new (options: RazorpayCheckoutOptions) => {
            open: () => void;
            close?: () => void;
        };
    }
}

export interface LaunchRazorpayCheckoutParams {
    orderId: string;
    amount: number;
    keyId: string;
    currency?: string;
    itemName?: string;
    description?: string;
    customer?: {
        name?: string;
        email?: string;
        contact?: string;
    };
    onSuccess: (response: RazorpayPaymentSuccessResponse) => void;
    onDismiss?: () => void;
    onError?: (error: Error) => void;
}

// Dynamically injects Razorpay standard checkout script
export const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
        if (typeof window !== 'undefined' && window.Razorpay) {
            resolve(true);
            return;
        }

        const existingScript = document.querySelector(`script[src="${RAZORPAY_CONFIG.SCRIPT_URL}"]`);
        if (existingScript) {
            existingScript.addEventListener('load', () => resolve(true));
            existingScript.addEventListener('error', () => resolve(false));
            return;
        }

        const script = document.createElement('script');
        script.src = RAZORPAY_CONFIG.SCRIPT_URL;
        script.async = true;

        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);

        document.body.appendChild(script);
    });
};

// Initializes and triggers the Razorpay Checkout Modal
export const launchRazorpayCheckout = async (params: LaunchRazorpayCheckoutParams): Promise<boolean> => {
    const isLoaded = await loadRazorpayScript();

    if (!isLoaded || !window.Razorpay) {
        const loadError = new Error('Razorpay SDK failed to load. Please check your internet connection.');
        params.onError?.(loadError);
        return false;
    }

    try {
        const options: RazorpayCheckoutOptions = {
            key: params.keyId,
            amount: params.amount,
            currency: params.currency || RAZORPAY_CONFIG.CURRENCY,
            name: RAZORPAY_CONFIG.MERCHANT_NAME,
            description: params.description || `${RAZORPAY_CONFIG.DESCRIPTION_PREFIX}: ${params.itemName || 'Checkout'}`,
            order_id: params.orderId,
            handler: (response: RazorpayPaymentSuccessResponse) => {
                params.onSuccess(response);
            },
            prefill: {
                name: params.customer?.name || '',
                email: params.customer?.email || '',
                contact: params.customer?.contact || '',
            },
            theme: {
                color: RAZORPAY_CONFIG.THEME_COLOR,
            },
            modal: {
                ondismiss: () => {
                    params.onDismiss?.();
                },
            },
        };

        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.open();
        return true;
    } catch (err) {
        const launchError = err instanceof Error ? err : new Error('Failed to launch Razorpay checkout modal.');
        params.onError?.(launchError);
        return false;
    }
};
