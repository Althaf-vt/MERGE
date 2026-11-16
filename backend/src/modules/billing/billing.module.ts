import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BILLING_FACADE } from '../connections/application/interfaces/billing-facade.interface';
import { SCENE_PARTNER_SUBSCRIPTION_FACADE } from '../scene-partner/application/interfaces/scene-partner-subscription-facade.interface';

import { BillingTransactionSchema, BillingTransactionSchemaClass } from './infrastructure/persistence/schemas/billing-transaction.schema';
import { CreditAccountSchema, CreditAccountSchemaClass } from './infrastructure/persistence/schemas/credit-account.schema';
import { CreditPackSchema, CreditPackSchemaClass } from './infrastructure/persistence/schemas/credit-pack.schema';
import { SubscriptionPlanSchema, SubscriptionPlanSchemaClass } from './infrastructure/persistence/schemas/subscription-plan.schema';
import { UserSubscriptionSchema, UserSubscriptionSchemaClass } from './infrastructure/persistence/schemas/user-subscription.schema';

import { SUBSCRIPTION_PLAN_REPOSITORY } from './domain/interfaces/subscription-plan-repository.interface';
import { MongoSubscriptionPlanRepository } from './infrastructure/persistence/repositories/mongo-subscription-plan.repository';
import { CREDIT_PACK_REPOSITORY } from './domain/interfaces/credit-pack-repository.interface';
import { MongoCreditPackRepository } from './infrastructure/persistence/repositories/mongo-credit-pack.repository';
import { USER_SUBSCRIPTION_REPOSITORY } from './domain/interfaces/user-subscription-repository.interface';
import { MongoUserSubscriptionRepository } from './infrastructure/persistence/repositories/mongo-user-subscription.repository';
import { CREDIT_ACCOUNT_REPOSITORY } from './domain/interfaces/credit-account-repository.interface';
import { MongoCreditAccountRepository } from './infrastructure/persistence/repositories/mongo-credit-account.repository';
import { BILLING_TRANSACTION_REPOSITORY } from './domain/interfaces/billing-transaction-repository.interface';
import { MongoBillingTransactionRepository } from './infrastructure/persistence/repositories/mongo-billing-transaction.repository';

import { PAYMENT_GATEWAY } from './application/interfaces/payment-gateway.interface';
import { RazorpayPaymentService } from './infrastructure/services/razorpay-payment.service';

import { CREATE_SUBSCRIPTION_PLAN_USE_CASE, GET_SUBSCRIPTION_PLAN_BY_ID_USE_CASE, GET_SUBSCRIPTION_PLANS_USE_CASE, UPDATE_SUBSCRIPTION_PLAN_USE_CASE } from './application/interfaces/subscription-plan.use-cases.interface';
import { CreateSubscriptionPlanUseCase } from './application/use-cases/create-subscription-plan.use-case';
import { GetSubscriptionPlanByIdUseCase } from './application/use-cases/get-subscription-plan-by-id.use-case';
import { GetSubscriptionPlansUseCase } from './application/use-cases/get-subscription-plans.use-case';
import { UpdateSubscriptionPlanUseCase } from './application/use-cases/update-subscription-plan.use-case';

import { CANCEL_SUBSCRIPTION_USE_CASE, GET_USER_SUBSCRIPTION_USE_CASE, PROCESS_SUBSCRIPTION_RENEWALS_USE_CASE, SUBSCRIBE_USER_USE_CASE, TOGGLE_AUTO_RENEWAL_USE_CASE } from './application/interfaces/subscription-lifecycle.use-cases.interface';
import { CancelSubscriptionUseCase } from './application/use-cases/cancel-subscription.use-case';
import { GetUserSubscriptionUseCase } from './application/use-cases/get-user-subscription.use-case';
import { ProcessSubscriptionRenewalsUseCase } from './application/use-cases/process-subscription-renewals.use-case';
import { SubscribeUserUseCase } from './application/use-cases/subscribe-user.use-case';
import { ToggleAutoRenewalUseCase } from './application/use-cases/toggle-auto-renewal.use-case';

import { CREATE_PAYMENT_ORDER_USE_CASE, VERIFY_PAYMENT_USE_CASE } from './application/interfaces/payment.use-cases.interface';
import { CreatePaymentOrderUseCase } from './application/use-cases/create-payment-order.use-case';
import { VerifyPaymentUseCase } from './application/use-cases/verify-payment.use-case';

import { CREATE_CREDIT_PACK_USE_CASE, DEDUCT_PRIORITY_CREDIT_USE_CASE, GET_CREDIT_PACKS_USE_CASE, GET_USER_CREDIT_BALANCE_USE_CASE, UPDATE_CREDIT_PACK_USE_CASE } from './application/interfaces/credit.use-cases.interface';
import { CreateCreditPackUseCase } from './application/use-cases/create-credit-pack.use-case';
import { DeductPriorityCreditUseCase } from './application/use-cases/deduct-priority-credit.use-case';
import { GetCreditPacksUseCase } from './application/use-cases/get-credit-packs.use-case';
import { GetUserCreditBalanceUseCase } from './application/use-cases/get-user-credit-balance.use-case';
import { UpdateCreditPackUseCase } from './application/use-cases/update-credit-pack.use-case';

import { GET_ADMIN_BILLING_HISTORY_USE_CASE, GET_USER_BILLING_HISTORY_USE_CASE } from './application/interfaces/billing-history.use-cases.interface';
import { GetAdminBillingHistoryUseCase } from './application/use-cases/get-admin-billing-history.use-case';
import { GetUserBillingHistoryUseCase } from './application/use-cases/get-user-billing-history.use-case';

import { BILLING_ADMIN_FACADE, BILLING_PRIORITY_CREDIT_FACADE, BILLING_SUBSCRIPTION_FACADE } from './application/interfaces/billing-facades.interface';
import { BillingAdminFacade } from './application/services/billing-admin.facade';
import { BillingPriorityCreditFacade } from './application/services/billing-priority-credit.facade';
import { BillingSubscriptionFacade } from './application/services/billing-subscription.facade';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: SubscriptionPlanSchemaClass.name, schema: SubscriptionPlanSchema },
            { name: CreditPackSchemaClass.name, schema: CreditPackSchema },
            { name: UserSubscriptionSchemaClass.name, schema: UserSubscriptionSchema },
            { name: CreditAccountSchemaClass.name, schema: CreditAccountSchema },
            { name: BillingTransactionSchemaClass.name, schema: BillingTransactionSchema },
        ]),
    ],
    providers: [
        // Repositories
        { provide: SUBSCRIPTION_PLAN_REPOSITORY, useClass: MongoSubscriptionPlanRepository },
        { provide: CREDIT_PACK_REPOSITORY, useClass: MongoCreditPackRepository },
        { provide: USER_SUBSCRIPTION_REPOSITORY, useClass: MongoUserSubscriptionRepository },
        { provide: CREDIT_ACCOUNT_REPOSITORY, useClass: MongoCreditAccountRepository },
        { provide: BILLING_TRANSACTION_REPOSITORY, useClass: MongoBillingTransactionRepository },

        // Payment Gateway
        { provide: PAYMENT_GATEWAY, useClass: RazorpayPaymentService },

        // UseCases
        { provide: GET_SUBSCRIPTION_PLANS_USE_CASE, useClass: GetSubscriptionPlansUseCase },
        { provide: GET_SUBSCRIPTION_PLAN_BY_ID_USE_CASE, useClass: GetSubscriptionPlanByIdUseCase },
        { provide: CREATE_SUBSCRIPTION_PLAN_USE_CASE, useClass: CreateSubscriptionPlanUseCase },
        { provide: UPDATE_SUBSCRIPTION_PLAN_USE_CASE, useClass: UpdateSubscriptionPlanUseCase },

        { provide: SUBSCRIBE_USER_USE_CASE, useClass: SubscribeUserUseCase },
        { provide: GET_USER_SUBSCRIPTION_USE_CASE, useClass: GetUserSubscriptionUseCase },
        { provide: CANCEL_SUBSCRIPTION_USE_CASE, useClass: CancelSubscriptionUseCase },
        { provide: TOGGLE_AUTO_RENEWAL_USE_CASE, useClass: ToggleAutoRenewalUseCase },
        { provide: PROCESS_SUBSCRIPTION_RENEWALS_USE_CASE, useClass: ProcessSubscriptionRenewalsUseCase },

        { provide: CREATE_PAYMENT_ORDER_USE_CASE, useClass: CreatePaymentOrderUseCase },
        { provide: VERIFY_PAYMENT_USE_CASE, useClass: VerifyPaymentUseCase },

        { provide: GET_CREDIT_PACKS_USE_CASE, useClass: GetCreditPacksUseCase },
        { provide: GET_USER_CREDIT_BALANCE_USE_CASE, useClass: GetUserCreditBalanceUseCase },
        { provide: DEDUCT_PRIORITY_CREDIT_USE_CASE, useClass: DeductPriorityCreditUseCase },
        { provide: CREATE_CREDIT_PACK_USE_CASE, useClass: CreateCreditPackUseCase },
        { provide: UPDATE_CREDIT_PACK_USE_CASE, useClass: UpdateCreditPackUseCase },

        { provide: GET_USER_BILLING_HISTORY_USE_CASE, useClass: GetUserBillingHistoryUseCase },
        { provide: GET_ADMIN_BILLING_HISTORY_USE_CASE, useClass: GetAdminBillingHistoryUseCase },

        // Facades
        BillingSubscriptionFacade,
        BillingPriorityCreditFacade,
        BillingAdminFacade,
        { provide: BILLING_SUBSCRIPTION_FACADE, useExisting: BillingSubscriptionFacade },
        { provide: BILLING_PRIORITY_CREDIT_FACADE, useExisting: BillingPriorityCreditFacade },
        { provide: BILLING_ADMIN_FACADE, useExisting: BillingAdminFacade },
        { provide: SCENE_PARTNER_SUBSCRIPTION_FACADE, useExisting: BillingSubscriptionFacade },
        { provide: BILLING_FACADE, useExisting: BillingPriorityCreditFacade },
    ],
    exports: [
        BillingSubscriptionFacade,
        BillingPriorityCreditFacade,
        BillingAdminFacade,
        BILLING_SUBSCRIPTION_FACADE,
        BILLING_PRIORITY_CREDIT_FACADE,
        BILLING_ADMIN_FACADE,
        SCENE_PARTNER_SUBSCRIPTION_FACADE,
        BILLING_FACADE,
    ],
})
export class BillingModule { }
