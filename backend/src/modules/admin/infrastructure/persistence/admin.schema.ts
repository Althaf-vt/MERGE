import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { AdminRole, AdminStatus } from "../../domain/enums/admin.enums";
import { Document, Types } from "mongoose";
import { AdminPermission } from "../../domain/enums/admin-permission.enums";

export type AdminDocument = Admin & Document;

@Schema({ timestamps: true, collection: 'admins' })
export class Admin {
    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    email: string;

    @Prop({ required: true })
    passwordHash: string;

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