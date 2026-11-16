import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BillingPeriod, Currency, SubscriptionEntitlement } from '../../../domain/enums/billing.enums';

// Subdocument Schema: Money
@Schema({ _id: false })
export class MoneySchemaClass {
    @Prop({ required: true, type: Number })
    amount: number;

    @Prop({ required: true, type: String, enum: Currency })
    currency: Currency;
}

export const MoneySchema = SchemaFactory.createForClass(MoneySchemaClass);

// Subdocument Schema: Plan Offer
@Schema({ _id: false })
export class PlanOfferSchemaClass {
    @Prop({ required: true, trim: true, uppercase: true })
    code: string;

    @Prop({ required: true, type: Number })
    discountPercentage: number;

    @Prop({ required: true, type: Date })
    validFrom: Date;

    @Prop({ required: true, type: Date })
    validUntil: Date;

    @Prop({ required: true, type: Boolean, default: true })
    isActive: boolean;
}

export const PlanOfferSchema = SchemaFactory.createForClass(PlanOfferSchemaClass);

// Root Document Schema: Subscription Plan
export type SubscriptionPlanDocument = SubscriptionPlanSchemaClass & Document;

@Schema({ timestamps: true, collection: 'subscription_plans' })
export class SubscriptionPlanSchemaClass {
    @Prop({ type: String, required: true })
    _id: string;

    @Prop({ required: true, trim: true })
    name: string;

    @Prop({ required: true, trim: true, uppercase: true, unique: true })
    code: string;

    @Prop({ required: true, type: String, enum: BillingPeriod })
    billingPeriod: BillingPeriod;

    @Prop({ required: true, type: MoneySchema })
    price: MoneySchemaClass;

    @Prop({ required: true, type: [String], enum: SubscriptionEntitlement })
    entitlements: SubscriptionEntitlement[];

    @Prop({ type: [PlanOfferSchema], default: [] })
    offers: PlanOfferSchemaClass[];

    @Prop({ required: true, type: Number, default: 0 })
    sortOrder: number;

    @Prop({ required: true, type: Boolean, default: true })
    isActive: boolean;

    createdAt: Date;
    updatedAt: Date;
}

export const SubscriptionPlanSchema = SchemaFactory.createForClass(SubscriptionPlanSchemaClass);

SubscriptionPlanSchema.index({ code: 1 }, { unique: true });
SubscriptionPlanSchema.index({ isActive: 1, sortOrder: 1 });
SubscriptionPlanSchema.index({ createdAt: -1 });
