import { Body, Controller, HttpCode, HttpStatus, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../shared/infrastructure/security/guards/jwt-auth.guard';
import { UserSessionGuard } from '../../../../shared/infrastructure/security/guards/user-session.guard';
import { AuthenticatedRequest } from '../../../../shared/infrastructure/security/interfaces/authenticated-request.interface';
import { API_ENDPOINTS } from '../../../../shared/presentation/constants/api-endpoints.constant';
import { RESPONSE_MESSAGES } from '../../../../shared/presentation/constants/response-messages.constant';
import { ApiResponse } from '../../../../shared/presentation/interfaces/api-response.interface';
import { ApiResponseHelper } from '../../../../shared/presentation/utils/api-response.helper';
import { CreatePaymentOrderDto } from '../../application/dtos/create-payment-order.dto';
import { PaymentOrderResponseDto } from '../../application/dtos/payment-order-response.dto';
import { PaymentVerificationResponseDto } from '../../application/dtos/payment-verification-response.dto';
import { VerifyPaymentDto } from '../../application/dtos/verify-payment.dto';
import { CREATE_PAYMENT_ORDER_USE_CASE, ICreatePaymentOrderUseCase, IVerifyPaymentUseCase, VERIFY_PAYMENT_USE_CASE } from '../../application/interfaces/payment.use-cases.interface';

@Controller(API_ENDPOINTS.BILLING.PAYMENTS.BASE)
@UseGuards(JwtAuthGuard, UserSessionGuard)
export class PaymentController {
    constructor(
        @Inject(CREATE_PAYMENT_ORDER_USE_CASE) private readonly _createPaymentOrderUseCase: ICreatePaymentOrderUseCase,
        @Inject(VERIFY_PAYMENT_USE_CASE) private readonly _verifyPaymentUseCase: IVerifyPaymentUseCase,
    ) { }

    @Post(API_ENDPOINTS.BILLING.PAYMENTS.ORDER)
    @HttpCode(HttpStatus.CREATED)
    async createOrder(
        @Req() req: AuthenticatedRequest,
        @Body() dto: CreatePaymentOrderDto,
    ): Promise<ApiResponse<PaymentOrderResponseDto>> {
        const result = await this._createPaymentOrderUseCase.execute(req.user.userId, dto);
        return ApiResponseHelper.success(RESPONSE_MESSAGES.BILLING.ORDER_CREATED, result);
    }

    @Post(API_ENDPOINTS.BILLING.PAYMENTS.VERIFY)
    @HttpCode(HttpStatus.OK)
    async verifyPayment(
        @Req() req: AuthenticatedRequest,
        @Body() dto: VerifyPaymentDto,
    ): Promise<ApiResponse<PaymentVerificationResponseDto>> {
        const result = await this._verifyPaymentUseCase.execute(req.user.userId, dto);
        return ApiResponseHelper.success(RESPONSE_MESSAGES.BILLING.PAYMENT_VERIFIED, result);
    }
}
