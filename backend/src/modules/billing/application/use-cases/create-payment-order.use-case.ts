import { Inject, Injectable } from '@nestjs/common';
import { ErrorCode } from '../../../../shared/domain/enums/error-code.enum';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { BILLING_ERROR_MESSAGES } from '../../domain/constants/billing-error-messages.constants';
import { BILLING_ID_PREFIXES, generateBillingId } from '../../domain/constants/billing.constants';
import { BillingItemType } from '../../domain/enums/billing.enums';
import { ICreditPackRepository, CREDIT_PACK_REPOSITORY } from '../../domain/interfaces/credit-pack-repository.interface';
import { ISubscriptionPlanRepository, SUBSCRIPTION_PLAN_REPOSITORY } from '../../domain/interfaces/subscription-plan-repository.interface';
import { MoneyVO } from '../../domain/value-objects/money.vo';
import { CreatePaymentOrderDto } from '../dtos/create-payment-order.dto';
import { PaymentOrderResponseDto } from '../dtos/payment-order-response.dto';
import { IPaymentGateway, PAYMENT_GATEWAY } from '../interfaces/payment-gateway.interface';
import { ICreatePaymentOrderUseCase } from '../interfaces/payment.use-cases.interface';

@Injectable()
export class CreatePaymentOrderUseCase implements ICreatePaymentOrderUseCase {
    constructor(
        @Inject(PAYMENT_GATEWAY) private readonly _paymentGateway: IPaymentGateway,
        @Inject(SUBSCRIPTION_PLAN_REPOSITORY) private readonly _subscriptionPlanRepository: ISubscriptionPlanRepository,
        @Inject(CREDIT_PACK_REPOSITORY) private readonly _creditPackRepository: ICreditPackRepository,
    ) { }

    async execute(userId: string, dto: CreatePaymentOrderDto): Promise<PaymentOrderResponseDto> {
        if (!userId || userId.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.USER_ID_REQUIRED);
        }

        if (!dto.itemId || dto.itemId.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.ITEM_ID_REQUIRED);
        }

        let priceVO: MoneyVO;
        let itemName: string;

        if (dto.itemType === BillingItemType.PLAN) {
            const plan = await this._subscriptionPlanRepository.findById(dto.itemId.trim());
            if (!plan) {
                throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.PLAN_NOT_FOUND);
            }
            if (!plan.isActive) {
                throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.PLAN_INACTIVE);
            }
            priceVO = plan.calculateEffectivePrice();
            itemName = plan.name;
        } else if (dto.itemType === BillingItemType.CREDIT_PACK) {
            const pack = await this._creditPackRepository.findById(dto.itemId.trim());
            if (!pack) {
                throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.CREDIT_PACK_NOT_FOUND);
            }
            if (!pack.isActive || !pack.isListed) {
                throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.CREDIT_PACK_UNLISTED);
            }
            priceVO = pack.price;
            itemName = pack.name;
        } else {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.ITEM_TYPE_REQUIRED);
        }

        const receipt = generateBillingId(BILLING_ID_PREFIXES.TRANSACTION);

        const order = await this._paymentGateway.createOrder({
            amount: priceVO.amount,
            currency: priceVO.currency,
            receipt,
            notes: {
                userId: userId.trim(),
                itemId: dto.itemId.trim(),
                itemType: dto.itemType,
                promoCode: dto.promoCode ?? '',
            },
        });

        return {
            orderId: order.orderId,
            amount: order.amount,
            currency: order.currency,
            keyId: order.keyId,
            itemName,
            itemType: dto.itemType,
            receipt,
        };
    }
}
