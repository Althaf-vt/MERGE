import { CreatePaymentOrderDto } from '../dtos/create-payment-order.dto';
import { PaymentOrderResponseDto } from '../dtos/payment-order-response.dto';
import { PaymentVerificationResponseDto } from '../dtos/payment-verification-response.dto';
import { VerifyPaymentDto } from '../dtos/verify-payment.dto';

export const CREATE_PAYMENT_ORDER_USE_CASE = 'CREATE_PAYMENT_ORDER_USE_CASE';
export const VERIFY_PAYMENT_USE_CASE = 'VERIFY_PAYMENT_USE_CASE';

export interface ICreatePaymentOrderUseCase {
    execute(userId: string, dto: CreatePaymentOrderDto): Promise<PaymentOrderResponseDto>;
}

export interface IVerifyPaymentUseCase {
    execute(userId: string, dto: VerifyPaymentDto): Promise<PaymentVerificationResponseDto>;
}
