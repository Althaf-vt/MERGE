import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { AdminAuditAction, AdminAuditResourceType } from '../../domain/enums/admin-audit.enums';

export type AdminAuditLogDocument = AdminAuditLogSchemaClass & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false }, collection: 'admin_audit_logs' })
export class AdminAuditLogSchemaClass {
    @Prop({ required: true, index: true })
    adminId: string;

    @Prop({ type: String, default: null })
    adminEmail?: string | null;

    @Prop({ type: String, default: null })
    adminName?: string | null;

    @Prop({ type: String, enum: AdminAuditAction, required: true, index: true })
    action: string;

    @Prop({ type: String, enum: AdminAuditResourceType, required: true, index: true })
    resourceType: string;

    @Prop({ required: true, index: true })
    resourceId: string;

    @Prop({ type: SchemaTypes.Mixed, default: null })
    details?: Record<string, unknown> | null;

    @Prop({ type: String, default: null })
    ipAddress?: string | null;

    @Prop({ type: String, default: null })
    userAgent?: string | null;

    createdAt: Date;
}

export const AdminAuditLogSchema = SchemaFactory.createForClass(AdminAuditLogSchemaClass);

AdminAuditLogSchema.index({ resourceType: 1, resourceId: 1, createdAt: -1 });
AdminAuditLogSchema.index({ adminId: 1, createdAt: -1 });
AdminAuditLogSchema.index({ createdAt: -1 });
