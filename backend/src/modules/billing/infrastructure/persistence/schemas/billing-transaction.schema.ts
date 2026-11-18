import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { BillingTransactionType, PaymentEnvironment, TransactionStatus } from '../../../domain/enums/billing.enums';
import { MoneySchema, MoneySchemaClass } from './subscription-plan.schema';

export type BillingTransactionDocument = BillingTransactionSchemaClass & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false }, collection: 'billing_transactions' })
export class BillingTransactionSchemaClass {
    @Prop({ type: String, required: true })
    _id: string;

    @Prop({ required: true, index: true })
    userId: string;

    @Prop({ required: true, type: String, enum: BillingTransactionType, index: true })
    type: BillingTransactionType;

    @Prop({ required: true, type: String, enum: TransactionStatus, index: true })
    status: TransactionStatus;

    @Prop({ type: MoneySchema, default: null })
    amount?: MoneySchemaClass | null;

    @Prop({ required: true, type: Number, default: 0 })
    creditsDelta: number;

    @Prop({ required: true })
    description: string;

    @Prop({ type: String, default: null, index: true })
    referenceId?: string | null;

    @Prop({ type: String, default: null })
    gatewayPaymentId?: string | null;

    @Prop({ type: String, default: null })
    gatewayOrderId?: string | null;

    @Prop({ type: String, default: null })
    receiptNumber?: string | null;

    @Prop({ required: true, type: String, enum: PaymentEnvironment, default: PaymentEnvironment.TEST })
    environment: PaymentEnvironment;

    @Prop({ type: MongooseSchema.Types.Mixed, default: null })
    metadata?: Record<string, string | number | boolean> | null;

    createdAt: Date;
}

export const BillingTransactionSchema = SchemaFactory.createForClass(BillingTransactionSchemaClass);

BillingTransactionSchema.index({ userId: 1, createdAt: -1 });
BillingTransactionSchema.index({ type: 1, createdAt: -1 });
BillingTransactionSchema.index({ status: 1, createdAt: -1 });
BillingTransactionSchema.index({ gatewayOrderId: 1 }, { sparse: true });
BillingTransactionSchema.index({ gatewayPaymentId: 1 }, { unique: true, sparse: true });
BillingTransactionSchema.index({ receiptNumber: 1 }, { sparse: true });
