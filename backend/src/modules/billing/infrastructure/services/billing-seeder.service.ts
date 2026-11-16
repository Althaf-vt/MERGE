import { Inject, Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { createDefaultCreditPacks, createDefaultSubscriptionPlans } from '../../domain/constants/default-billing-data.constants';
import { CreditPack } from '../../domain/entities/credit-pack.entity';
import { SubscriptionPlan } from '../../domain/entities/subscription-plan.entity';
import { ICreditPackRepository, CREDIT_PACK_REPOSITORY } from '../../domain/interfaces/credit-pack-repository.interface';
import { ISubscriptionPlanRepository, SUBSCRIPTION_PLAN_REPOSITORY } from '../../domain/interfaces/subscription-plan-repository.interface';

@Injectable()
export class BillingSeederService implements OnApplicationBootstrap {
    private readonly _logger = new Logger(BillingSeederService.name);

    constructor(
        @Inject(SUBSCRIPTION_PLAN_REPOSITORY) private readonly _subscriptionPlanRepository: ISubscriptionPlanRepository,
        @Inject(CREDIT_PACK_REPOSITORY) private readonly _creditPackRepository: ICreditPackRepository,
    ) { }

    async onApplicationBootstrap(): Promise<void> {
        try {
            await this._seedSubscriptionPlans();
            await this._seedCreditPacks();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorStack = error instanceof Error ? error.stack : undefined;
            this._logger.error(`Failed to execute Billing seeder on application bootstrap: ${errorMessage}`, errorStack);
        }
    }

    private async _seedSubscriptionPlans(): Promise<void> {
        const planCount = await this._subscriptionPlanRepository.count();
        if (planCount > 0) {
            this._logger.log(`Subscription plans already exist (${planCount} found). Skipping plans seeder.`);
            return;
        }

        const defaultPlanProps = createDefaultSubscriptionPlans();
        for (const props of defaultPlanProps) {
            const plan = SubscriptionPlan.create(props);
            await this._subscriptionPlanRepository.create(plan);
        }

        this._logger.log(`Successfully seeded ${defaultPlanProps.length} default subscription plans into database.`);
    }

    private async _seedCreditPacks(): Promise<void> {
        const packCount = await this._creditPackRepository.count();
        if (packCount > 0) {
            this._logger.log(`Credit packs already exist (${packCount} found). Skipping credit packs seeder.`);
            return;
        }

        const defaultPackProps = createDefaultCreditPacks();
        for (const props of defaultPackProps) {
            const pack = CreditPack.create(props);
            await this._creditPackRepository.create(pack);
        }

        this._logger.log(`Successfully seeded ${defaultPackProps.length} default credit packs into database.`);
    }
}
