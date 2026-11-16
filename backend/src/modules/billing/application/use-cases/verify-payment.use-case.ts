import { Inject, Injectable } from '@nestjs/common';
import { ErrorCode } from '../../../../shared/domain/enums/error-code.enum';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { BILLING_ERROR_MESSAGES } from '../../domain/constants/billing-error-messages.constants';
import { BILLING_ID_PREFIXES, generateBillingId, PAYMENT_MESSAGES } from '../../domain/constants/billing.constants';
import { BillingTransaction } from '../../domain/entities/billing-transaction.entity';
import { CreditAccount } from '../../domain/entities/credit-account.entity';
import { UserSubscription } from '../../domain/entities/user-subscription.entity';
import { BillingItemType, PaymentEnvironment } from '../../domain/enums/billing.enums';
import { BILLING_TRANSACTION_REPOSITORY, IBillingTransactionRepository } from '../../domain/interfaces/billing-transaction-repository.interface';
import { CREDIT_ACCOUNT_REPOSITORY, ICreditAccountRepository } from '../../domain/interfaces/credit-account-repository.interface';
import { CREDIT_PACK_REPOSITORY, ICreditPackRepository } from '../../domain/interfaces/credit-pack-repository.interface';
import { ISubscriptionPlanRepository, SUBSCRIPTION_PLAN_REPOSITORY } from '../../domain/interfaces/subscription-plan-repository.interface';
import { IUserSubscriptionRepository, USER_SUBSCRIPTION_REPOSITORY } from '../../domain/interfaces/user-subscription-repository.interface';
import { PlanBillingPeriod } from '../../domain/value-objects/plan-billing-period.vo';
import { PaymentVerificationResponseDto } from '../dtos/payment-verification-response.dto';
import { VerifyPaymentDto } from '../dtos/verify-payment.dto';
import { IPaymentGateway, PAYMENT_GATEWAY } from '../interfaces/payment-gateway.interface';
import { IVerifyPaymentUseCase } from '../interfaces/payment.use-cases.interface';

@Injectable()
export class VerifyPaymentUseCase implements IVerifyPaymentUseCase {
    constructor(
        @Inject(PAYMENT_GATEWAY) private readonly _paymentGateway: IPaymentGateway,
        @Inject(SUBSCRIPTION_PLAN_REPOSITORY) private readonly _subscriptionPlanRepository: ISubscriptionPlanRepository,
        @Inject(CREDIT_PACK_REPOSITORY) private readonly _creditPackRepository: ICreditPackRepository,
        @Inject(USER_SUBSCRIPTION_REPOSITORY) private readonly _userSubscriptionRepository: IUserSubscriptionRepository,
        @Inject(CREDIT_ACCOUNT_REPOSITORY) private readonly _creditAccountRepository: ICreditAccountRepository,
        @Inject(BILLING_TRANSACTION_REPOSITORY) private readonly _billingTransactionRepository: IBillingTransactionRepository,
    ) { }

    async execute(userId: string, dto: VerifyPaymentDto): Promise<PaymentVerificationResponseDto> {
        if (!userId || userId.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.USER_ID_REQUIRED);
        }

        if (!dto.orderId || dto.orderId.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.ORDER_ID_REQUIRED);
        }

        if (!dto.paymentId || dto.paymentId.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.PAYMENT_ID_REQUIRED);
        }

        if (!dto.signature || dto.signature.trim().length === 0) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.SIGNATURE_REQUIRED);
        }

        // Idempotency check: prevent duplicate credit top-ups or period extensions
        const existingTx = await this._billingTransactionRepository.findByGatewayPaymentId(dto.paymentId.trim());
        if (existingTx) {
            return {
                success: true,
                referenceId: existingTx.referenceId ?? '',
                transactionId: existingTx.id,
                itemType: dto.itemType,
                message: PAYMENT_MESSAGES.PAYMENT_ALREADY_VERIFIED,
            };
        }

        // Cryptographic HMAC signature verification
        const isValid = this._paymentGateway.verifyPaymentSignature({
            orderId: dto.orderId.trim(),
            paymentId: dto.paymentId.trim(),
            signature: dto.signature.trim(),
        });

        if (!isValid) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.INVALID_PAYMENT_SIGNATURE);
        }

        const now = new Date();
        const environment = this._paymentGateway.environment;
        let referenceId = '';
        let transactionId = '';

        if (dto.itemType === BillingItemType.PLAN) {
            const plan = await this._subscriptionPlanRepository.findById(dto.itemId.trim());
            if (!plan) {
                throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.PLAN_NOT_FOUND);
            }

            const activeSub = await this._userSubscriptionRepository.findActiveByUserId(userId.trim());
            let subId: string;

            if (activeSub && activeSub.isActive(now)) {
                const newEnd = PlanBillingPeriod.create(plan.billingPeriod).calculatePeriodEnd(
                    activeSub.currentPeriodEnd,
                );
                activeSub.renewPeriod({
                    newPeriodEnd: newEnd,
                    paymentMethodRef: dto.paymentId.trim(),
                });
                await this._userSubscriptionRepository.update(activeSub);
                subId = activeSub.id;
            } else {
                const periodEnd = PlanBillingPeriod.create(plan.billingPeriod).calculatePeriodEnd(now);
                const newSub = UserSubscription.subscribe({
                    id: generateBillingId(BILLING_ID_PREFIXES.SUBSCRIPTION),
                    userId: userId.trim(),
                    planId: plan.id,
                    periodStart: now,
                    periodEnd,
                    autoRenew: true,
                    paymentMethodRef: dto.paymentId.trim(),
                    entitlements: plan.entitlements,
                });
                await this._userSubscriptionRepository.create(newSub);
                subId = newSub.id;
            }

            const effectivePrice = plan.calculateEffectivePrice(now);
            const transaction = BillingTransaction.createSubscriptionPurchase({
                id: generateBillingId(BILLING_ID_PREFIXES.TRANSACTION),
                userId: userId.trim(),
                planId: plan.id,
                planName: plan.name,
                price: effectivePrice,
                gatewayOrderId: dto.orderId.trim(),
                gatewayPaymentId: dto.paymentId.trim(),
                receiptNumber: dto.orderId.trim(),
                environment,
            });

            await this._billingTransactionRepository.create(transaction);
            referenceId = subId;
            transactionId = transaction.id;
        } else if (dto.itemType === BillingItemType.CREDIT_PACK) {
            const pack = await this._creditPackRepository.findById(dto.itemId.trim());
            if (!pack) {
                throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.CREDIT_PACK_NOT_FOUND);
            }

            let creditAccount = await this._creditAccountRepository.findByUserId(userId.trim());
            if (!creditAccount) {
                creditAccount = CreditAccount.initialize(
                    generateBillingId(BILLING_ID_PREFIXES.CREDIT_ACCOUNT),
                    userId.trim(),
                    0,
                );
                await this._creditAccountRepository.create(creditAccount);
            }

            creditAccount.credit({
                amount: pack.creditsCount,
                reason: pack.name,
                referenceId: pack.id,
            });
            await this._creditAccountRepository.update(creditAccount);

            const transaction = BillingTransaction.createCreditPurchase({
                id: generateBillingId(BILLING_ID_PREFIXES.TRANSACTION),
                userId: userId.trim(),
                packId: pack.id,
                packName: pack.name,
                creditsCount: pack.creditsCount,
                price: pack.price,
                gatewayOrderId: dto.orderId.trim(),
                gatewayPaymentId: dto.paymentId.trim(),
                receiptNumber: dto.orderId.trim(),
                environment,
            });

            await this._billingTransactionRepository.create(transaction);
            referenceId = creditAccount.id;
            transactionId = transaction.id;
        } else {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.ITEM_TYPE_REQUIRED);
        }

        return {
            success: true,
            referenceId,
            transactionId,
            itemType: dto.itemType,
            message: PAYMENT_MESSAGES.PAYMENT_VERIFIED,
        };
    }
}
