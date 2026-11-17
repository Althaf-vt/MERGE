import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MoneySchema, MoneySchemaClass, PlanOfferSchema, PlanOfferSchemaClass } from './subscription-plan.schema';

export type CreditPackDocument = CreditPackSchemaClass & Document;

@Schema({ timestamps: true, collection: 'credit_packs' })
export class CreditPackSchemaClass {
    @Prop({ type: String, required: true })
    _id: string;

    @Prop({ required: true, trim: true })
    name: string;

    @Prop({ required: true, trim: true, uppercase: true, unique: true })
    code: string;

    @Prop({ required: true, type: Number })
    creditsCount: number;

    @Prop({ required: true, type: MoneySchema })
    price: MoneySchemaClass;

    @Prop({ type: [PlanOfferSchema], default: [] })
    offers: PlanOfferSchemaClass[];

    @Prop({ type: String, default: null })
    badge?: string | null;

    @Prop({ required: true, type: Number, default: 0 })
    sortOrder: number;

    @Prop({ required: true, type: Boolean, default: true })
    isListed: boolean;

    @Prop({ required: true, type: Boolean, default: true })
    isActive: boolean;

    createdAt: Date;
    updatedAt: Date;
}

export const CreditPackSchema = SchemaFactory.createForClass(CreditPackSchemaClass);

CreditPackSchema.index({ isListed: 1, isActive: 1, sortOrder: 1 });
CreditPackSchema.index({ createdAt: -1 });
