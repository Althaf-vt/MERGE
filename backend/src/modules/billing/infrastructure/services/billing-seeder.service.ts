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
        if (planCount === 0) {
            const defaultPlanProps = createDefaultSubscriptionPlans();
            for (const props of defaultPlanProps) {
                const plan = SubscriptionPlan.create(props);
                await this._subscriptionPlanRepository.create(plan);
            }
            this._logger.log(`Successfully seeded ${defaultPlanProps.length} default subscription plans into database.`);
            return;
        }

        // Synchronize existing plans to ensure normalizedName is populated in database
        const existingPlans = await this._subscriptionPlanRepository.findAll();
        for (const plan of existingPlans) {
            await this._subscriptionPlanRepository.update(plan);
        }
        this._logger.log(`Synchronized ${existingPlans.length} subscription plans with normalized names.`);
    }

    private async _seedCreditPacks(): Promise<void> {
        const defaultPackProps = createDefaultCreditPacks();
        const packCount = await this._creditPackRepository.count();
        if (packCount === 0) {
            for (const props of defaultPackProps) {
                const pack = CreditPack.create(props);
                await this._creditPackRepository.create(pack);
            }
            this._logger.log(`Successfully seeded ${defaultPackProps.length} default credit packs into database.`);
            return;
        }

        // Synchronize default pack names and ensure normalizedName is populated in database
        const allPacks = await this._creditPackRepository.findAll();
        for (const pack of allPacks) {
            const defaultProp = defaultPackProps.find((p) => p.code === pack.code);
            if (defaultProp && pack.name !== defaultProp.name) {
                pack.updateDetails({
                    name: defaultProp.name,
                    creditsCount: defaultProp.creditsCount,
                    price: defaultProp.price,
                    badge: defaultProp.badge,
                    sortOrder: defaultProp.sortOrder,
                });
                await this._creditPackRepository.update(pack);
                this._logger.log(`Updated credit pack ${pack.code} name to "${defaultProp.name}".`);
            } else {
                await this._creditPackRepository.update(pack);
            }
        }
        this._logger.log(`Synchronized ${allPacks.length} credit packs with normalized names.`);
    }
}
