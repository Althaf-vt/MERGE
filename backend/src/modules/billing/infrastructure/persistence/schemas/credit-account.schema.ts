import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CreditAccountDocument = CreditAccountSchemaClass & Document;

@Schema({ timestamps: true, collection: 'credit_accounts' })
export class CreditAccountSchemaClass {
    @Prop({ type: String, required: true })
    _id: string;

    @Prop({ required: true, unique: true })
    userId: string;

    @Prop({ required: true, type: Number, default: 0, min: 0 })
    balance: number;

    createdAt: Date;
    updatedAt: Date;
}

export const CreditAccountSchema = SchemaFactory.createForClass(CreditAccountSchemaClass);
