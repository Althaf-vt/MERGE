import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import Razorpay from 'razorpay';
import { ErrorCode } from '../../../../shared/domain/enums/error-code.enum';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { EnvConfig } from '../../../../shared/infrastructure/config/env.config';
import { CreatePaymentOrderParams, IPaymentGateway, PaymentOrderResult, VerifyPaymentSignatureParams } from '../../application/interfaces/payment-gateway.interface';
import { BILLING_ERROR_MESSAGES } from '../../domain/constants/billing-error-messages.constants';

@Injectable()
export class RazorpayPaymentService implements IPaymentGateway {
    private readonly _razorpay: Razorpay;

    constructor() {
        this._razorpay = new Razorpay({
            key_id: EnvConfig.razorpay.keyId,
            key_secret: EnvConfig.razorpay.keySecret,
        });
    }

    public async createOrder(params: CreatePaymentOrderParams): Promise<PaymentOrderResult> {
        try {
            const amountInSubunits = Math.round(params.amount * 100);

            const options = {
                amount: amountInSubunits,
                currency: params.currency,
                receipt: params.receipt,
                notes: params.notes ?? {},
            };

            const order = await this._razorpay.orders.create(options);

            return {
                orderId: order.id,
                amount: params.amount,
                currency: params.currency,
                keyId: EnvConfig.razorpay.keyId,
            };
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : BILLING_ERROR_MESSAGES.PAYMENT_ORDER_CREATION_FAILED;
            throw new DomainException(
                ErrorCode.INTERNAL_SERVER_ERROR,
                `${BILLING_ERROR_MESSAGES.PAYMENT_ORDER_CREATION_FAILED}: ${message}`,
            );
        }
    }

    public verifyPaymentSignature(params: VerifyPaymentSignatureParams): boolean {
        if (!params.orderId || !params.paymentId || !params.signature) {
            return false;
        }

        try {
            const text = `${params.orderId}|${params.paymentId}`;
            const expectedSignature = crypto
                .createHmac('sha256', EnvConfig.razorpay.keySecret)
                .update(text)
                .digest('hex');

            const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');
            const actualBuffer = Buffer.from(params.signature, 'utf-8');

            if (expectedBuffer.length !== actualBuffer.length) {
                return false;
            }

            return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
        } catch {
            return false;
        }
    }
}
