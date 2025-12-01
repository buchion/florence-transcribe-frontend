import { Repository } from 'typeorm';
import { AuditLog, AuditAction, AuditResourceType } from './entities/audit-log.entity';
export interface AuditLogData {
    userId?: number;
    userEmail?: string;
    sessionId?: number;
    patientId?: number;
    action: AuditAction;
    resourceType: AuditResourceType;
    resourceId?: number;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    requestPath?: string;
    requestMethod?: string;
}
export declare class AuditService {
    private auditLogRepository;
    constructor(auditLogRepository: Repository<AuditLog>);
    log(data: AuditLogData): Promise<AuditLog>;
    findByUserId(userId: number, limit?: number): Promise<AuditLog[]>;
    findByPatientId(patientId: number, limit?: number): Promise<AuditLog[]>;
    findBySessionId(sessionId: number, limit?: number): Promise<AuditLog[]>;
    findByResource(resourceType: AuditResourceType, resourceId: number, limit?: number): Promise<AuditLog[]>;
    findRecent(limit?: number): Promise<AuditLog[]>;
    findAccessToPHI(startDate?: Date, endDate?: Date, limit?: number): Promise<AuditLog[]>;
}
