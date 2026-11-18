import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SubscriptionEntitlement, SubscriptionStatus } from '../../../domain/enums/billing.enums';

export type UserSubscriptionDocument = UserSubscriptionSchemaClass & Document;

@Schema({ timestamps: true, collection: 'user_subscriptions' })
export class UserSubscriptionSchemaClass {
    @Prop({ type: String, required: true })
    _id: string;

    @Prop({ required: true, index: true })
    userId: string;

    @Prop({ required: true, index: true })
    planId: string;

    @Prop({ required: true, type: String, enum: SubscriptionStatus, index: true })
    status: SubscriptionStatus;

    @Prop({ required: true, type: Date })
    currentPeriodStart: Date;

    @Prop({ required: true, type: Date, index: true })
    currentPeriodEnd: Date;

    @Prop({ required: true, type: Boolean, default: true })
    autoRenew: boolean;

    @Prop({ type: Date, default: null })
    canceledAt?: Date | null;

    @Prop({ type: String, default: null })
    cancelReason?: string | null;

    @Prop({ type: String, default: null })
    paymentMethodRef?: string | null;

    @Prop({ required: true, type: [String], enum: SubscriptionEntitlement })
    entitlements: SubscriptionEntitlement[];

    createdAt: Date;
    updatedAt: Date;
}

export const UserSubscriptionSchema = SchemaFactory.createForClass(UserSubscriptionSchemaClass);

UserSubscriptionSchema.index({ userId: 1, status: 1 });
UserSubscriptionSchema.index(
    { userId: 1 },
    { unique: true, partialFilterExpression: { status: SubscriptionStatus.ACTIVE } },
);
UserSubscriptionSchema.index({ userId: 1, createdAt: -1 });
UserSubscriptionSchema.index({ status: 1, currentPeriodEnd: 1 });
