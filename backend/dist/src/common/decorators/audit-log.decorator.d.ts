import { AuditAction, AuditResourceType } from '../../audit/entities/audit-log.entity';
export declare const AUDIT_LOG_KEY = "audit_log";
export interface AuditLogMetadata {
    action: AuditAction;
    resourceType: AuditResourceType;
    resourceIdParam?: string;
    patientIdParam?: string;
    sessionIdParam?: string;
}
export declare const AuditLog: (metadata: AuditLogMetadata) => import("@nestjs/common").CustomDecorator<string>;
