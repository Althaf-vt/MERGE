import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { AdminRole, AdminStatus } from "../../domain/enums/admin.enums";
import { Document, Types } from "mongoose";
import { AdminPermission } from "../../domain/enums/admin-permission.enums";

export type AdminDocument = Admin & Document;

@Schema({ timestamps: true, collection: 'admins' })
export class Admin {
    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    email: string;

    @Prop({
        type: String,
        default: null,
        validate: {
            validator: function (this: any, val: string | null) {
                if (this.status !== 'INVITED') {
                    return typeof val === 'string' && val.trim().length > 0;
                }
                return true;
            },
            message: 'Password hash is required for active admins.'
        }
    })
    passwordHash: string | null;

    @Prop({ type: String, enum: AdminRole, required: true })
    role: string;

    @Prop({ required: true, trim: true })
    fullName: string;

    @Prop({ default: null })
    profilePhotoUrl?: string;

    @Prop({ type: String, enum: AdminStatus, default: AdminStatus.ACTIVE })
    status: string;

    @Prop({ type: [String], enum: AdminPermission, default: [] })
    permissions: string[];

    @Prop({ default: null })
    lastLoginAt?: Date;

    @Prop({ type: Types.ObjectId, ref: 'Admin', default: null })
    createdBy?: Types.ObjectId | string;

    createdAt: Date;
    updatedAt: Date;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);