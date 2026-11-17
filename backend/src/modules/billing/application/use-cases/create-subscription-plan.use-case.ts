import { Inject, Injectable } from '@nestjs/common';
import { ErrorCode } from '../../../../shared/domain/enums/error-code.enum';
import { DomainException } from '../../../../shared/domain/exceptions/domain.exception';
import { BILLING_ERROR_MESSAGES } from '../../domain/constants/billing-error-messages.constants';
import { SubscriptionPlan } from '../../domain/entities/subscription-plan.entity';
import { BillingPeriod } from '../../domain/enums/billing.enums';
import { ISubscriptionPlanRepository, SUBSCRIPTION_PLAN_REPOSITORY } from '../../domain/interfaces/subscription-plan-repository.interface';
import { BillingNormalizationUtil } from '../../domain/utils/billing-normalization.util';
import { CreateSubscriptionPlanDto } from '../dtos/manage-plan.dto';
import { SubscriptionPlanResponseDto } from '../dtos/subscription-plan-response.dto';
import { ICreateSubscriptionPlanUseCase } from '../interfaces/subscription-plan.use-cases.interface';
import { SubscriptionPlanDtoMapper } from '../mappers/subscription-plan-dto.mapper';

@Injectable()
export class CreateSubscriptionPlanUseCase implements ICreateSubscriptionPlanUseCase {
    constructor(
        @Inject(SUBSCRIPTION_PLAN_REPOSITORY) private readonly _subscriptionPlanRepository: ISubscriptionPlanRepository,
    ) { }

    async execute(dto: CreateSubscriptionPlanDto): Promise<SubscriptionPlanResponseDto> {
        // 1. Enforce normalized name uniqueness per billing period
        const normalizedName = BillingNormalizationUtil.normalizeName(dto.name);
        const existingWithName = await this._subscriptionPlanRepository.findByNormalizedName(
            normalizedName,
            dto.billingPeriod,
        );
        if (existingWithName) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.PLAN_NAME_ALREADY_EXISTS);
        }

        // 2. Validate explicit code or auto-generate unique code slug
        let code: string;
        if (dto.code && dto.code.trim().length > 0) {
            code = dto.code.trim().toUpperCase();
            const existingWithCode = await this._subscriptionPlanRepository.findByCode(code);
            if (existingWithCode) {
                throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.PLAN_CODE_ALREADY_EXISTS);
            }
        } else {
            code = await this._generateUniqueCode(dto.name, dto.billingPeriod);
        }

        // 3. Map create props and instantiate domain aggregate
        const createProps = SubscriptionPlanDtoMapper.toCreateProps(dto, code);
        const plan = SubscriptionPlan.create(createProps);

        const saved = await this._subscriptionPlanRepository.create(plan);
        return SubscriptionPlanDtoMapper.toResponseDto(saved);
    }

    private async _generateUniqueCode(name: string, billingPeriod: BillingPeriod): Promise<string> {
        const baseCode = BillingNormalizationUtil.generatePlanCode(name, billingPeriod);
        let candidate = baseCode;
        let suffix = 2;

        while (await this._subscriptionPlanRepository.findByCode(candidate)) {
            candidate = `${baseCode}_${suffix}`;
            suffix++;
        }

        return candidate;
    }
}
